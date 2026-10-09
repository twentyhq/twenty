import { type CoreApiClient } from 'twenty-client-sdk/core';

import { collectRecordsById } from 'src/utils/collect-records-by-id';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { hasLastContactChanged } from 'src/utils/has-last-contact-changed';
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

  // Read companies before their people: a company already up to date is then
  // skipped rather than lowered if a live job raises it during the recompute.
  const currentCompanyById = await collectRecordsById(
    client,
    'companies',
    companyIds,
    Object.keys(EMPTY_LAST_CONTACT),
  );
  const existingCompanyIds = companyIds.filter((companyId) =>
    currentCompanyById.has(companyId),
  );

  if (existingCompanyIds.length === 0) {
    return;
  }

  const topPersonByCompanyId = await collectTopPersonByCompanyId(
    client,
    existingCompanyIds,
  );

  const upserts: RecordUpsert[] = [];

  for (const companyId of existingCompanyIds) {
    const topPerson = topPersonByCompanyId.get(companyId);
    const data = topPerson
      ? buildLastContactData(topPerson)
      : EMPTY_LAST_CONTACT;
    const currentCompany = currentCompanyById.get(companyId);

    if (currentCompany && hasLastContactChanged(currentCompany, data)) {
      upserts.push({ id: companyId, ...data });
    }
  }

  await upsertRecordsInBatches(client, 'createCompanies', upserts);
};
