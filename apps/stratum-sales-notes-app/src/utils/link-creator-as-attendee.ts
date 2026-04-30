// Best-effort util: given the workspaceMember who created (or is logically
// the "author" of) a salesNote, find a Person whose primaryEmail matches
// their userEmail and insert a salesNoteAttendee linking them to the note.
//
// Used by:
//  - on-sales-note-created (legacy path: rep clicks "+ Sales note" or types
//    one in the UI; the workspaceMemberId comes from the event payload)
//  - voicenotes-webhook (new in Phase D: maps the inbound recording's
//    creator email to a Twenty workspaceMember, then re-uses this helper)
//
// Contract: this function NEVER throws. Anything that goes wrong (no email,
// no Person matched, mutation errors) is captured and returned as
// `{added: false, reason: '...'}`. Callers can decide to log or ignore.
//
// Logging note: we use `console.error` (not `console.log`) because the
// Railway worker only ships the error stream when APPLICATION_LOG_DRIVER is
// set to CONSOLE — matches the convention used elsewhere in this app.

import { CoreApiClient } from 'twenty-client-sdk/core';

type WorkspaceMemberInput = {
  id: string;
  userEmail?: string | null;
  name?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

const buildAttendeeName = (
  workspaceMember: WorkspaceMemberInput,
): string | undefined => {
  const firstName = workspaceMember.name?.firstName ?? '';
  const lastName = workspaceMember.name?.lastName ?? '';
  const joined = `${firstName} ${lastName}`.trim();

  if (joined.length > 0) {
    return joined;
  }

  if (
    typeof workspaceMember.userEmail === 'string' &&
    workspaceMember.userEmail.length > 0
  ) {
    return workspaceMember.userEmail;
  }

  return undefined;
};

export const linkCreatorAsAttendee = async (
  client: InstanceType<typeof CoreApiClient>,
  workspaceMember: WorkspaceMemberInput,
  salesNoteId: string,
): Promise<{ added: boolean; reason?: string }> => {
  try {
    const userEmail = workspaceMember.userEmail;

    if (typeof userEmail !== 'string' || userEmail.length === 0) {
      return { added: false, reason: 'no userEmail on workspaceMember' };
    }

    // Resolve userEmail → Person.id (case-insensitive equality).
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

    const attendeeName = buildAttendeeName(workspaceMember);
    const attendeeData: Record<string, unknown> = {
      salesNoteId,
      personId,
    };

    if (typeof attendeeName === 'string' && attendeeName.length > 0) {
      attendeeData.name = attendeeName;
    }

    // No idempotency check here — duplicates are rare (only when the rep
    // clicks "+ Sales note" from their own Person page) and harmless.
    await client.mutation({
      createSalesNoteAttendee: {
        __args: { data: attendeeData },
        id: true,
      },
    });

    return { added: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // eslint-disable-next-line no-console
    console.error(
      `[link-creator-as-attendee] failed for salesNoteId=${salesNoteId} workspaceMemberId=${workspaceMember.id}: ${message}`,
    );

    return { added: false, reason: `error: ${message}` };
  }
};
