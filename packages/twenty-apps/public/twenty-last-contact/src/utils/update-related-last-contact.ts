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

  const opportunityIds = await collectRelatedOpportunityIds(client, {
    personId,
    companyId,
  });

  if (opportunityIds.length === 0) {
    return;
  }

  await client.mutation({
    updateOpportunities: {
      __args: {
        data,
        filter: {
          and: [{ id: { in: opportunityIds } }, recencyGuard(occurredAt)],
        },
      },
      id: true,
    },
  });
};

const collectRelatedOpportunityIds = async (
  client: CoreApiClient,
  { personId, companyId }: { personId: string; companyId: string | null },
): Promise<string[]> => {
  const filters: Record<string, { eq: string }>[] = [
    { pointOfContactId: { eq: personId } },
  ];
  if (companyId) {
    filters.push({ companyId: { eq: companyId } });
  }

  const results = await Promise.all(
    filters.map((filter) =>
      client.query({
        opportunities: {
          __args: { filter, first: 200 },
          edges: { node: { id: true } },
        },
      }),
    ),
  );

  const ids = new Set<string>();
  for (const result of results) {
    for (const edge of result?.opportunities?.edges ?? []) {
      if (edge?.node?.id) {
        ids.add(edge.node.id);
      }
    }
  }

  return [...ids];
};
