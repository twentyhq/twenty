import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';

import { ON_SALES_NOTE_CREATED_LOGIC_FUNCTION_UID } from 'src/constants/universal-identifiers';

// Shape of the relevant fields off a freshly-created salesNote. Only fields
// we read need to be listed.
type SalesNoteAfter = {
  ownerId?: string | null;
};

type SalesNoteCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<SalesNoteAfter>
>;

// Auto-default the salesNote.owner to the creating workspace member, AND
// add the creator's matching Person record as an attendee on the new note.
// Fires on every salesNote.created event.
//
// Owner step (primary): skipped when ownerId is already set, or the event
// has no workspaceMemberId (API-key creation).
//
// Attendee step (best-effort, won't fail the handler): looks up the
// workspaceMember to get userEmail, then finds a Person whose primary email
// matches. If no Person matches, logs the reason and continues — most reps
// aren't in their own CRM as a contact, so this is expected for some users.
//
// Logging note: console.* output goes to LocalDriver child stdout/stderr,
// which only surfaces to railway logs when twenty-worker has
// APPLICATION_LOG_DRIVER=CONSOLE (default is DISABLED, which silently drops
// the lines). See plan-file lesson #11. We log on patch and on error so
// the steady-state worker log isn't flooded.

const linkCreatorAsAttendee = async (
  client: InstanceType<typeof CoreApiClient>,
  salesNoteId: string,
  workspaceMemberId: string,
): Promise<{ added: boolean; reason?: string }> => {
  // 1. Resolve workspaceMember → userEmail
  const wmResp = (await client.query({
    workspaceMembers: {
      __args: { filter: { id: { eq: workspaceMemberId } } },
      edges: { node: { id: true, userEmail: true } },
    },
  })) as {
    workspaceMembers?: {
      edges?: {
        node?: { id?: string | null; userEmail?: string | null } | null;
      }[] | null;
    } | null;
  };

  const userEmail = wmResp?.workspaceMembers?.edges?.[0]?.node?.userEmail;

  if (typeof userEmail !== 'string' || userEmail.length === 0) {
    return { added: false, reason: 'no userEmail on workspaceMember' };
  }

  // 2. Resolve userEmail → Person.id (case-insensitive equality)
  const personResp = (await client.query({
    people: {
      __args: {
        filter: { emails: { primaryEmail: { ilike: userEmail } } },
      },
      edges: { node: { id: true } },
    },
  })) as {
    people?: {
      edges?: { node?: { id?: string | null } | null }[] | null;
    } | null;
  };

  const personId = personResp?.people?.edges?.[0]?.node?.id;

  if (typeof personId !== 'string' || personId.length === 0) {
    return {
      added: false,
      reason: `no Person matching userEmail=${userEmail}`,
    };
  }

  // 3. Insert salesNoteAttendee linking that Person to the new salesNote.
  // No idempotency check here — duplicates are rare (only when the rep clicks
  // "+ Sales note" from their own Person page) and harmless. If it becomes a
  // problem, query existing attendees first.
  await client.mutation({
    createSalesNoteAttendee: {
      __args: { data: { salesNoteId, personId } },
      id: true,
    },
  });

  return { added: true };
};

const handler = async (
  event: SalesNoteCreateEvent,
): Promise<object | undefined> => {
  const after = event.properties.after;

  if (after?.ownerId != null && after.ownerId !== '') {
    return { skipped: true, reason: 'ownerId already set' };
  }

  const workspaceMemberId = event.workspaceMemberId;

  if (workspaceMemberId == null || workspaceMemberId === '') {
    return {
      skipped: true,
      reason: 'no workspaceMemberId on event (API-key creation?)',
    };
  }

  const client = new CoreApiClient();

  // Owner patch — primary path. If this throws, the handler fails.
  try {
    await client.mutation({
      updateSalesNote: {
        __args: {
          id: event.recordId,
          data: { ownerId: workspaceMemberId },
        },
        id: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // eslint-disable-next-line no-console
    console.error(
      `[on-sales-note-created] mutation failed for salesNoteId=${event.recordId}: ${message}`,
    );
    throw err;
  }

  // Attendee link — best effort. Failures here are logged but don't propagate
  // (the owner patch already succeeded, which is the main contract).
  let attendeeOutcome: { added: boolean; reason?: string };
  try {
    attendeeOutcome = await linkCreatorAsAttendee(
      client,
      event.recordId,
      workspaceMemberId,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    attendeeOutcome = { added: false, reason: `error: ${message}` };
  }

  // eslint-disable-next-line no-console
  console.error(
    `[on-sales-note-created] patched salesNoteId=${event.recordId} ownerId=${workspaceMemberId} attendeeAdded=${attendeeOutcome.added}` +
      (attendeeOutcome.reason ? ` (${attendeeOutcome.reason})` : ''),
  );

  return {
    patched: true,
    salesNoteId: event.recordId,
    ownerId: workspaceMemberId,
    attendeeAdded: attendeeOutcome.added,
    ...(attendeeOutcome.reason
      ? { attendeeSkipReason: attendeeOutcome.reason }
      : {}),
  };
};

export default defineLogicFunction({
  universalIdentifier: ON_SALES_NOTE_CREATED_LOGIC_FUNCTION_UID,
  name: 'on-sales-note-created',
  description:
    "Auto-defaults a sales note's owner to the workspace member who created the record (when the rep didn't pick one themselves), and adds the creator's matching Person record (by email) as an attendee.",
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'salesNote.created',
  },
});
