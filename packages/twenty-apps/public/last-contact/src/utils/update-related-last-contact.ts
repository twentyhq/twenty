import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { type InteractionKind } from 'src/utils/update-person-last-contact';

const PAGE_SIZE = 200;

export type RelatedInteraction = {
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
}: RelatedInteraction): Record<string, string | null> => ({
  lastContactAt: occurredAt,
  lastContactItemMessageId: kind === 'email' ? itemId : null,
  lastContactItemCalendarEventId: kind === 'meeting' ? itemId : null,
});

const collectCompanyIdByPersonId = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<Map<string, string>> => {
  const companyIdByPersonId = new Map<string, string>();

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { people } = await executeWithRetry(() =>
        client.query({
          people: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: { node: { id: true, companyId: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of people?.edges ?? []) {
        const { id, companyId } = edge.node;

        if (id && companyId) {
          companyIdByPersonId.set(id, companyId);
        }
      }

      after = people?.pageInfo.hasNextPage
        ? (people.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return companyIdByPersonId;
};

const collectPointOfContactIds = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<Set<string>> => {
  const pointOfContactIds = new Set<string>();

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { opportunities } = await executeWithRetry(() =>
        client.query({
          opportunities: {
            __args: {
              filter: { pointOfContactId: { in: ids } },
              first: PAGE_SIZE,
              after,
            },
            edges: { node: { id: true, pointOfContactId: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of opportunities?.edges ?? []) {
        const { pointOfContactId } = edge.node;

        if (pointOfContactId) {
          pointOfContactIds.add(pointOfContactId);
        }
      }

      after = opportunities?.pageInfo.hasNextPage
        ? (opportunities.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return pointOfContactIds;
};

// Companies and opportunities surface emails and meetings from their related
// people, so their last contact mirrors the most recent contact of any person
// connected to them.
export const updateRelatedLastContactForPeople = async (
  client: CoreApiClient,
  contactByPersonId: Map<string, RelatedInteraction>,
): Promise<void> => {
  const personIds = [...contactByPersonId.keys()];

  if (personIds.length === 0) {
    return;
  }

  const companyIdByPersonId = await collectCompanyIdByPersonId(
    client,
    personIds,
  );
  const contactByCompanyId = new Map<string, RelatedInteraction>();

  for (const [personId, contact] of contactByPersonId) {
    const companyId = companyIdByPersonId.get(personId);

    if (!companyId) {
      continue;
    }

    const current = contactByCompanyId.get(companyId);

    if (!current || contact.occurredAt > current.occurredAt) {
      contactByCompanyId.set(companyId, contact);
    }
  }

  for (const [companyId, contact] of contactByCompanyId) {
    await executeWithRetry(() =>
      client.mutation({
        updateCompanies: {
          __args: {
            data: buildData(contact),
            filter: {
              and: [
                { id: { eq: companyId } },
                recencyGuard(contact.occurredAt),
              ],
            },
          },
          id: true,
        },
      }),
    );
  }

  const pointOfContactIds = await collectPointOfContactIds(client, personIds);

  for (const personId of pointOfContactIds) {
    const contact = contactByPersonId.get(personId);

    if (!contact) {
      continue;
    }

    await executeWithRetry(() =>
      client.mutation({
        updateOpportunities: {
          __args: {
            data: buildData(contact),
            filter: {
              and: [
                { pointOfContactId: { eq: personId } },
                recencyGuard(contact.occurredAt),
              ],
            },
          },
          id: true,
        },
      }),
    );
  }
};
