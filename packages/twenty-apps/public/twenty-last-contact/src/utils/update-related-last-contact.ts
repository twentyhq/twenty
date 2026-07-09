import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type InteractionKind } from 'src/utils/update-person-last-contact';

export type RelatedInteraction = {
  personId: string;
  occurredAt: string;
  itemId: string;
  kind: InteractionKind;
};

const recencyGuard = (occurredAt: string) => ({
  or: [
    { lastContactAt: { is: 'NULL' } },
    { lastContactAt: { lt: occurredAt } },
  ],
});

const buildData = ({
  occurredAt,
  itemId,
  kind,
}: Omit<RelatedInteraction, 'personId'>): Record<string, string | null> => ({
  lastContactAt: occurredAt,
  lastContactItemMessageId: kind === 'email' ? itemId : null,
  lastContactItemCalendarEventId: kind === 'meeting' ? itemId : null,
});

// Companies and opportunities surface emails and meetings from their related
// people, so their last contact mirrors the most recent contact of any person
// connected to them.
export const updateRelatedLastContact = async (
  client: CoreApiClient,
  { personId, occurredAt, itemId, kind }: RelatedInteraction,
): Promise<void> => {
  const personResult = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      companyId: true,
    },
  });

  const companyId =
    (personResult?.person as { companyId?: string | null } | null | undefined)
      ?.companyId ?? null;
  const data = buildData({ occurredAt, itemId, kind });

  if (companyId) {
    await client.mutation({
      updateCompanies: {
        __args: {
          data,
          filter: { and: [{ id: { eq: companyId } }, recencyGuard(occurredAt)] },
        },
        id: true,
      },
    });
  }

  await client.mutation({
    updateOpportunities: {
      __args: {
        data,
        filter: {
          and: [
            { pointOfContactId: { eq: personId } },
            recencyGuard(occurredAt),
          ],
        },
      },
      id: true,
    },
  });
};
