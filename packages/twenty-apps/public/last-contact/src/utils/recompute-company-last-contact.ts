import { type CoreApiClient } from 'twenty-client-sdk/core';

import { collectExistingRecordIds } from 'src/utils/collect-existing-record-ids';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

const PAGE_SIZE = 200;
const MAX_SCAN_PAGES = 5;

const EMPTY_LAST_CONTACT: Record<string, string | null> = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type PersonNode = {
  companyId?: string | null;
  lastContactAt?: string | null;
  lastContactItemMessage?: { id: string } | null;
  lastContactItemCalendarEvent?: { id: string } | null;
};

const PERSON_LAST_CONTACT_SELECTION = {
  companyId: true,
  lastContactAt: true,
  lastContactItemMessage: { id: true },
  lastContactItemCalendarEvent: { id: true },
};

const buildLastContactData = (
  person: PersonNode,
): Record<string, string | null> => ({
  lastContactAt: person.lastContactAt ?? null,
  lastContactItemMessageId: person.lastContactItemMessage?.id ?? null,
  lastContactItemCalendarEventId:
    person.lastContactItemCalendarEvent?.id ?? null,
});

const fetchTopPersonForCompany = async (
  client: CoreApiClient,
  companyId: string,
): Promise<PersonNode | undefined> => {
  const { people } = await executeWithRetry(() =>
    client.query({
      people: {
        __args: {
          filter: {
            companyId: { eq: companyId },
            lastContactAt: { is: 'NOT_NULL' },
          },
          orderBy: [{ lastContactAt: 'DescNullsLast' }],
          first: 1,
        },
        edges: { node: PERSON_LAST_CONTACT_SELECTION },
      },
    }),
  );

  return people?.edges?.[0]?.node as PersonNode | undefined;
};

const collectTopPersonByCompanyId = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, PersonNode>> => {
  const topPersonByCompanyId = new Map<string, PersonNode>();
  const unresolvedCompanyIds = new Set(companyIds);

  let after: string | undefined;
  let scannedPages = 0;
  let hasNextPage = false;

  do {
    const { people } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: {
              companyId: { in: companyIds },
              lastContactAt: { is: 'NOT_NULL' },
            },
            orderBy: [{ lastContactAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after,
          },
          edges: { node: PERSON_LAST_CONTACT_SELECTION },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of people?.edges ?? []) {
      const person = edge.node as PersonNode;
      const companyId = person.companyId;

      if (companyId && unresolvedCompanyIds.has(companyId)) {
        topPersonByCompanyId.set(companyId, person);
        unresolvedCompanyIds.delete(companyId);
      }
    }

    scannedPages += 1;
    hasNextPage = people?.pageInfo.hasNextPage ?? false;
    after = hasNextPage ? (people?.pageInfo.endCursor ?? undefined) : undefined;
  } while (
    after &&
    unresolvedCompanyIds.size > 0 &&
    scannedPages < MAX_SCAN_PAGES
  );

  if (hasNextPage) {
    for (const companyId of unresolvedCompanyIds) {
      const topPerson = await fetchTopPersonForCompany(client, companyId);

      if (topPerson) {
        topPersonByCompanyId.set(companyId, topPerson);
      }
    }
  }

  return topPersonByCompanyId;
};

export const recomputeCompaniesLastContact = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<void> => {
  if (companyIds.length === 0) {
    return;
  }

  const [topPersonByCompanyId, existingCompanyIds] = await Promise.all([
    collectTopPersonByCompanyId(client, companyIds),
    collectExistingRecordIds(client, 'companies', companyIds),
  ]);

  const upserts: RecordUpsert[] = companyIds
    .filter((companyId) => existingCompanyIds.has(companyId))
    .map((companyId) => {
      const topPerson = topPersonByCompanyId.get(companyId);

      return {
        id: companyId,
        ...(topPerson ? buildLastContactData(topPerson) : EMPTY_LAST_CONTACT),
      };
    });

  await upsertRecordsInBatches(client, 'createCompanies', upserts);
};
