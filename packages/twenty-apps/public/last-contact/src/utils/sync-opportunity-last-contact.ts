import { type CoreApiClient } from 'twenty-client-sdk/core';

type LastContactData = Record<string, string | null>;

const EMPTY_LAST_CONTACT: LastContactData = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

const readPersonLastContact = async (
  client: CoreApiClient,
  personId: string,
): Promise<LastContactData> => {
  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      lastContactAt: true,
      lastContactItemMessageId: true,
      lastContactItemCalendarEventId: true,
    },
  });

  const current = (person ?? {}) as {
    lastContactAt?: string | null;
    lastContactItemMessageId?: string | null;
    lastContactItemCalendarEventId?: string | null;
  };

  if (!current.lastContactAt) {
    return EMPTY_LAST_CONTACT;
  }

  return {
    lastContactAt: current.lastContactAt,
    lastContactItemMessageId: current.lastContactItemMessageId ?? null,
    lastContactItemCalendarEventId:
      current.lastContactItemCalendarEventId ?? null,
  };
};

// An opportunity's last contact is defined as its point of contact's last
// contact, so reassigning that person must overwrite it in both directions,
// including back to empty when the new contact has no history. The recency
// guard used elsewhere would leave the previous contact's values in place.
export const syncOpportunityLastContact = async (
  client: CoreApiClient,
  {
    opportunityId,
    pointOfContactId,
  }: { opportunityId: string; pointOfContactId: string | null },
): Promise<void> => {
  const data = pointOfContactId
    ? await readPersonLastContact(client, pointOfContactId)
    : EMPTY_LAST_CONTACT;

  await client.mutation({
    updateOpportunity: {
      __args: { id: opportunityId, data },
      id: true,
    },
  });
};
