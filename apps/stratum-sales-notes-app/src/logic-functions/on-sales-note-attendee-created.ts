import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';

import { ON_SALES_NOTE_ATTENDEE_CREATED_LOGIC_FUNCTION_UID } from 'src/constants/universal-identifiers';

// Shape of the relevant fields off a freshly-created salesNoteAttendee row.
// Only fields we read need to be listed.
type SalesNoteAttendeeAfter = {
  salesNoteId?: string | null;
  personId?: string | null;
};

type SalesNoteAttendeeCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<SalesNoteAttendeeAfter>
>;

// When a salesNoteAttendee is created and the parent salesNote has no
// Account (companyId) set, copy the attached Person's Company onto the
// salesNote. Saves the rep the manual click on the very common
// "create note → add attendee → also set their account" workflow.
//
// Decision tree:
//  1. read salesNoteId + personId off the event payload; bail if either is
//     missing (shouldn't happen but defensive)
//  2. fetch the Person to get their companyId; bail if no company
//  3. fetch the salesNote to check companyId; bail if already set
//  4. patch salesNote.companyId = person.companyId
//
// Wrapped in try/catch — never throws. A failure here must not block the
// underlying attendee creation (which already succeeded by the time this
// fires) nor cause silent BullMQ retries.
//
// Logging note: console.* output goes to LocalDriver child stdout/stderr,
// surfaced to railway logs only when twenty-worker has
// APPLICATION_LOG_DRIVER=CONSOLE. Use console.error to match the existing
// pattern.

const handler = async (
  event: SalesNoteAttendeeCreateEvent,
): Promise<object | undefined> => {
  try {
    const after = event.properties.after;
    const salesNoteId = after?.salesNoteId;
    const personId = after?.personId;

    if (
      typeof salesNoteId !== 'string' ||
      salesNoteId.length === 0 ||
      typeof personId !== 'string' ||
      personId.length === 0
    ) {
      // eslint-disable-next-line no-console
      console.error(
        `[on-sales-note-attendee-created] missing fk: salesNoteId=${salesNoteId} personId=${personId}`,
      );
      return { skipped: true, reason: 'missing fk' };
    }

    const client = new CoreApiClient();

    // 1. Fetch person to get their companyId.
    const personResp = (await client.query({
      people: {
        __args: { filter: { id: { eq: personId } } },
        edges: {
          node: {
            id: true,
            companyId: true,
            name: { firstName: true, lastName: true },
          },
        },
      },
    })) as {
      people?: {
        edges?:
          | {
              node?: {
                id?: string | null;
                companyId?: string | null;
                name?: {
                  firstName?: string | null;
                  lastName?: string | null;
                } | null;
              } | null;
            }[]
          | null;
      } | null;
    };

    const personNode = personResp?.people?.edges?.[0]?.node;
    const personCompanyId = personNode?.companyId;

    if (
      typeof personCompanyId !== 'string' ||
      personCompanyId.length === 0
    ) {
      // eslint-disable-next-line no-console
      console.error(
        `[on-sales-note-attendee-created] person has no company: salesNoteId=${salesNoteId} personId=${personId}`,
      );
      return { skipped: true, reason: 'person has no company' };
    }

    // 2. Fetch salesNote to check whether companyId is already set.
    const salesNoteResp = (await client.query({
      salesNotes: {
        __args: { filter: { id: { eq: salesNoteId } } },
        edges: {
          node: {
            id: true,
            companyId: true,
            name: true,
          },
        },
      },
    })) as {
      salesNotes?: {
        edges?:
          | {
              node?: {
                id?: string | null;
                companyId?: string | null;
                name?: string | null;
              } | null;
            }[]
          | null;
      } | null;
    };

    const salesNoteNode = salesNoteResp?.salesNotes?.edges?.[0]?.node;
    const existingCompanyId = salesNoteNode?.companyId;

    if (
      typeof existingCompanyId === 'string' &&
      existingCompanyId.length > 0
    ) {
      // eslint-disable-next-line no-console
      console.error(
        `[on-sales-note-attendee-created] salesNote already has company: salesNoteId=${salesNoteId} existingCompanyId=${existingCompanyId}`,
      );
      return { skipped: true, reason: 'salesNote already has company' };
    }

    // 3. Patch salesNote.companyId.
    await client.mutation({
      updateSalesNote: {
        __args: {
          id: salesNoteId,
          data: { companyId: personCompanyId },
        },
        id: true,
      },
    });

    // eslint-disable-next-line no-console
    console.error(
      `[on-sales-note-attendee-created] company set: salesNoteId=${salesNoteId} companyId=${personCompanyId} (from personId=${personId})`,
    );

    return {
      action: 'company_set',
      salesNoteId,
      companyId: personCompanyId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // eslint-disable-next-line no-console
    console.error(
      `[on-sales-note-attendee-created] error: ${message} (recordId=${event.recordId})`,
    );

    return { error: message };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_SALES_NOTE_ATTENDEE_CREATED_LOGIC_FUNCTION_UID,
  name: 'on-sales-note-attendee-created',
  description:
    "When a salesNoteAttendee is created and the parent salesNote has no Account set, copy the attached Person's Company onto the salesNote. Skips if person has no company or salesNote already has one.",
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'salesNoteAttendee.created',
  },
});
