// When a salesNote.meetingId is set (on create or update), copy the linked
// calendar event's matched participants (`personId IS NOT NULL`) onto the
// salesNote as salesNoteAttendees. Skip Persons who are already attendees.
//
// Used by:
//  - on-sales-note-created (when a salesNote is created with meetingId set,
//    e.g. via API)
//  - on-sales-note-meeting-set (when an existing salesNote has its meetingId
//    updated from null to a value)
//
// Contract: never throws. Failures are captured and returned as
// `{ added, skipped, reason }`. Each per-attendee create is also wrapped so
// a single bad row doesn't abort the rest.
//
// Logging note: console.error so output is captured even under the default
// Railway worker driver — matches the existing app convention.

import { CoreApiClient } from 'twenty-client-sdk/core';

type CalendarEventNode = {
  id?: string | null;
  title?: string | null;
};

type CalendarEventParticipantNode = {
  id?: string | null;
  personId?: string | null;
  person?: {
    id?: string | null;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
};

type SalesNoteAttendeeNode = {
  id?: string | null;
  personId?: string | null;
};

type SalesNoteNode = {
  id?: string | null;
  name?: string | null;
};

const buildAttendeeName = (
  personFirstName: string | null | undefined,
  personLastName: string | null | undefined,
  salesNoteName: string | null | undefined,
): string | undefined => {
  const personName = `${personFirstName ?? ''} ${personLastName ?? ''}`.trim();

  if (personName.length === 0) {
    return undefined;
  }

  if (typeof salesNoteName === 'string' && salesNoteName.length > 0) {
    return `${personName} @ ${salesNoteName}`;
  }

  return personName;
};

export const inheritMeetingAttendees = async (
  client: InstanceType<typeof CoreApiClient>,
  salesNoteId: string,
  meetingId: string,
): Promise<{ added: number; skipped: number; reason?: string }> => {
  try {
    // 1. Fetch the calendar event (for cached-name hint via title).
    const meetingResp = (await client.query({
      calendarEvents: {
        __args: { filter: { id: { eq: meetingId } } },
        edges: {
          node: {
            id: true,
            title: true,
          },
        },
      },
    })) as {
      calendarEvents?: {
        edges?: { node?: CalendarEventNode | null }[] | null;
      } | null;
    };

    const meetingNode = meetingResp?.calendarEvents?.edges?.[0]?.node;

    if (meetingNode == null || typeof meetingNode.id !== 'string') {
      return { added: 0, skipped: 0, reason: 'meeting not found' };
    }

    // 2. Fetch the meeting's matched participants. The matching step on
    // calendarEventParticipant fills `personId` when an attendee's email
    // matches a Person in the workspace; we only want those.
    const participantsResp = (await client.query({
      calendarEventParticipants: {
        __args: { filter: { calendarEventId: { eq: meetingId } } },
        edges: {
          node: {
            id: true,
            personId: true,
            person: {
              id: true,
              name: { firstName: true, lastName: true },
            },
          },
        },
      },
    })) as {
      calendarEventParticipants?: {
        edges?: { node?: CalendarEventParticipantNode | null }[] | null;
      } | null;
    };

    const matchedParticipants = (
      participantsResp?.calendarEventParticipants?.edges ?? []
    )
      .map((edge) => edge?.node)
      .filter(
        (node): node is CalendarEventParticipantNode & { personId: string } =>
          node != null &&
          typeof node.personId === 'string' &&
          node.personId.length > 0,
      );

    if (matchedParticipants.length === 0) {
      return { added: 0, skipped: 0, reason: 'no matched participants' };
    }

    // 3. Fetch existing salesNoteAttendees so we don't create duplicates.
    const salesNoteResp = (await client.query({
      salesNotes: {
        __args: { filter: { id: { eq: salesNoteId } } },
        edges: {
          node: {
            id: true,
            name: true,
          },
        },
      },
    })) as {
      salesNotes?: {
        edges?: { node?: SalesNoteNode | null }[] | null;
      } | null;
    };

    const salesNoteNode = salesNoteResp?.salesNotes?.edges?.[0]?.node;

    if (salesNoteNode == null || typeof salesNoteNode.id !== 'string') {
      return { added: 0, skipped: 0, reason: 'salesNote not found' };
    }

    const salesNoteName = salesNoteNode.name ?? '';

    const attendeesResp = (await client.query({
      salesNoteAttendees: {
        __args: { filter: { salesNoteId: { eq: salesNoteId } } },
        edges: {
          node: {
            id: true,
            personId: true,
          },
        },
      },
    })) as {
      salesNoteAttendees?: {
        edges?: { node?: SalesNoteAttendeeNode | null }[] | null;
      } | null;
    };

    const existingPersonIds = new Set<string>(
      (attendeesResp?.salesNoteAttendees?.edges ?? [])
        .map((edge) => edge?.node?.personId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    );

    // 4. Create salesNoteAttendee rows for new participants.
    let added = 0;
    let skipped = 0;

    for (const participant of matchedParticipants) {
      const personId = participant.personId;

      if (existingPersonIds.has(personId)) {
        skipped += 1;
        continue;
      }

      const attendeeName = buildAttendeeName(
        participant.person?.name?.firstName,
        participant.person?.name?.lastName,
        salesNoteName,
      );

      const data: Record<string, unknown> = { salesNoteId, personId };

      if (typeof attendeeName === 'string' && attendeeName.length > 0) {
        data.name = attendeeName;
      }

      try {
        await client.mutation({
          createSalesNoteAttendee: {
            __args: { data },
            id: true,
          },
        });
        added += 1;
        // Add to the set in case the meeting has duplicate-personId entries.
        existingPersonIds.add(personId);
      } catch (innerErr) {
        const message =
          innerErr instanceof Error ? innerErr.message : String(innerErr);

        // eslint-disable-next-line no-console
        console.error(
          `[inherit-meeting-attendees] create failed for salesNoteId=${salesNoteId} personId=${personId}: ${message}`,
        );
        skipped += 1;
      }
    }

    return { added, skipped };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // eslint-disable-next-line no-console
    console.error(
      `[inherit-meeting-attendees] error: ${message} (salesNoteId=${salesNoteId} meetingId=${meetingId})`,
    );

    return { added: 0, skipped: 0, reason: `error: ${message}` };
  }
};
