import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { type InteractionKind } from 'src/utils/update-person-last-contact';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

const PAGE_SIZE = 200;

export type RelatedInteraction = {
  occurredAt: string;
  itemId: string;
  kind: InteractionKind;
};

type OpportunityLink = {
  opportunityId: string;
  pointOfContactId: string;
  lastContactAt: string | null;
};

const isNewer = (
  candidate: string,
  current: string | null | undefined,
): boolean => !current || current < candidate;

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

const collectCompanyLastContactAt = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, string | null>> => {
  const lastContactAtByCompanyId = new Map<string, string | null>();

  for (const ids of chunk(companyIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { companies } = await executeWithRetry(() =>
        client.query({
          companies: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: { node: { id: true, lastContactAt: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of companies?.edges ?? []) {
        const { id, lastContactAt } = edge.node;

        if (id) {
          lastContactAtByCompanyId.set(id, lastContactAt ?? null);
        }
      }

      after = companies?.pageInfo.hasNextPage
        ? (companies.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return lastContactAtByCompanyId;
};

const collectOpportunityLinks = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<OpportunityLink[]> => {
  const links: OpportunityLink[] = [];

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
            edges: {
              node: {
                id: true,
                pointOfContactId: true,
                lastContactAt: true,
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of opportunities?.edges ?? []) {
        const { id, pointOfContactId, lastContactAt } = edge.node;

        if (id && pointOfContactId) {
          links.push({
            opportunityId: id,
            pointOfContactId,
            lastContactAt: lastContactAt ?? null,
          });
        }
      }

      after = opportunities?.pageInfo.hasNextPage
        ? (opportunities.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return links;
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

  const lastContactAtByCompanyId = await collectCompanyLastContactAt(
    client,
    [...contactByCompanyId.keys()],
  );
  const companyUpserts: RecordUpsert[] = [];

  for (const [companyId, contact] of contactByCompanyId) {
    if (!lastContactAtByCompanyId.has(companyId)) {
      continue;
    }

    if (isNewer(contact.occurredAt, lastContactAtByCompanyId.get(companyId))) {
      companyUpserts.push({ id: companyId, ...buildData(contact) });
    }
  }

  await upsertRecordsInBatches(client, 'createCompanies', companyUpserts);

  const opportunityLinks = await collectOpportunityLinks(client, personIds);
  const opportunityUpserts: RecordUpsert[] = [];

  for (const { opportunityId, pointOfContactId, lastContactAt } of opportunityLinks) {
    const contact = contactByPersonId.get(pointOfContactId);

    if (!contact || !isNewer(contact.occurredAt, lastContactAt)) {
      continue;
    }

    opportunityUpserts.push({ id: opportunityId, ...buildData(contact) });
  }

  await upsertRecordsInBatches(
    client,
    'createOpportunities',
    opportunityUpserts,
  );
};
