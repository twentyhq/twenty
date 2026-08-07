import { type CoreApiClient } from 'twenty-client-sdk/core';

type LastContactData = Record<string, string | null>;

const EMPTY_LAST_CONTACT: LastContactData = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type PersonLastContact = {
  lastContactAt?: string | null;
  lastContactItemMessage?: { id: string } | null;
  lastContactItemCalendarEvent?: { id: string } | null;
};

// An opportunity's last contact mirrors its point of contact, so it must be
// recomputed whenever the opportunity is created or its point of contact changes,
// not only when an interaction happens.
export const recomputeOpportunityLastContact = async (
  client: CoreApiClient,
  opportunityId: string,
): Promise<void> => {
  const { opportunity } = await client.query({
    opportunity: {
      __args: { filter: { id: { eq: opportunityId } } },
      id: true,
      pointOfContactId: true,
    },
  });

  const pointOfContactId =
    (opportunity as { pointOfContactId?: string | null } | null | undefined)
      ?.pointOfContactId ?? null;

  let data: LastContactData = EMPTY_LAST_CONTACT;

  if (pointOfContactId) {
    const { person } = await client.query({
      person: {
        __args: { filter: { id: { eq: pointOfContactId } } },
        id: true,
        lastContactAt: true,
        lastContactItemMessage: { id: true },
        lastContactItemCalendarEvent: { id: true },
      },
    });

    const current = (person ?? {}) as PersonLastContact;

    data = {
      lastContactAt: current.lastContactAt ?? null,
      lastContactItemMessageId: current.lastContactItemMessage?.id ?? null,
      lastContactItemCalendarEventId:
        current.lastContactItemCalendarEvent?.id ?? null,
    };
  }

  await client.mutation({
    updateOpportunity: {
      __args: { id: opportunityId, data },
      id: true,
    },
  });
};
