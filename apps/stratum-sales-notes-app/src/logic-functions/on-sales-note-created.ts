import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';

import { ON_SALES_NOTE_CREATED_LOGIC_FUNCTION_UID } from 'src/constants/universal-identifiers';
import { linkCreatorAsAttendee } from 'src/utils/link-creator-as-attendee';

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
// Implementation lives in src/utils/link-creator-as-attendee.ts so the
// upcoming voicenotes-webhook handler can re-use it.
//
// Logging note: console.* output goes to LocalDriver child stdout/stderr,
// which only surfaces to railway logs when twenty-worker has
// APPLICATION_LOG_DRIVER=CONSOLE (default is DISABLED, which silently drops
// the lines). See plan-file lesson #11. We log on patch and on error so
// the steady-state worker log isn't flooded.

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

  // Attendee link — best effort. Failures here are logged by the util but
  // don't propagate (the owner patch already succeeded, which is the main
  // contract). We fetch the workspaceMember (id + userEmail + name) here
  // and pass the object to the util so it doesn't have to do the lookup
  // itself — same shape the voicenotes-webhook handler will pass.
  let attendeeOutcome: { added: boolean; reason?: string };
  try {
    const wmResp = (await client.query({
      workspaceMembers: {
        __args: { filter: { id: { eq: workspaceMemberId } } },
        edges: {
          node: {
            id: true,
            userEmail: true,
            name: { firstName: true, lastName: true },
          },
        },
      },
    })) as {
      workspaceMembers?: {
        edges?:
          | {
              node?: {
                id?: string | null;
                userEmail?: string | null;
                name?: {
                  firstName?: string | null;
                  lastName?: string | null;
                } | null;
              } | null;
            }[]
          | null;
      } | null;
    };

    const wmNode = wmResp?.workspaceMembers?.edges?.[0]?.node;

    if (wmNode == null || typeof wmNode.id !== 'string' || wmNode.id.length === 0) {
      attendeeOutcome = {
        added: false,
        reason: `workspaceMember not found for id=${workspaceMemberId}`,
      };
    } else {
      attendeeOutcome = await linkCreatorAsAttendee(
        client,
        {
          id: wmNode.id,
          userEmail: wmNode.userEmail ?? null,
          name: wmNode.name ?? null,
        },
        event.recordId,
      );
    }
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
