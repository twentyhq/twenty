import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { collectExistingRecordIds } from 'src/utils/collect-existing-record-ids';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

// The server caps a group-by at this many groups per call.
const GROUPS_PER_QUERY = 50;

const EMPTY_LAST_CONTACT: Record<string, string | null> = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type PersonNode = {
  lastContactAt?: string | null;
  lastContactItemMessage?: { id: string } | null;
  lastContactItemCalendarEvent?: { id: string } | null;
};

type PersonGroup = {
  groupByDimensionValues?: unknown[] | null;
  edges?: { node: PersonNode }[] | null;
};

const buildLastContactData = (
  person: PersonNode,
): Record<string, string | null> => ({
  lastContactAt: person.lastContactAt ?? null,
  lastContactItemMessageId: person.lastContactItemMessage?.id ?? null,
  lastContactItemCalendarEventId: person.lastContactItemCalendarEvent?.id ?? null,
});

// Grouping people by their company and ordering each group by contact recency
// yields every company's most recently contacted person in one call, where
// asking company by company costs one indexed lookup each.
const collectTopPersonByCompanyId = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, PersonNode>> => {
  const topPersonByCompanyId = new Map<string, PersonNode>();

  for (const ids of chunk(companyIds, GROUPS_PER_QUERY)) {
    const { peopleGroupBy } = await executeWithRetry(() =>
      client.query({
        peopleGroupBy: {
          __args: {
            groupBy: [{ company: { id: true } }],
            filter: {
              companyId: { in: ids },
              lastContactAt: { is: 'NOT_NULL' },
            },
            orderByForRecords: [{ lastContactAt: 'DescNullsLast' }],
            limit: GROUPS_PER_QUERY,
          },
          groupByDimensionValues: true,
          edges: {
            node: {
              lastContactAt: true,
              lastContactItemMessage: { id: true },
              lastContactItemCalendarEvent: { id: true },
            },
          },
        },
      }),
    );

    for (const group of (peopleGroupBy ?? []) as PersonGroup[]) {
      const companyId = group.groupByDimensionValues?.[0];
      const topPerson = group.edges?.[0]?.node;

      if (typeof companyId === 'string' && topPerson) {
        topPersonByCompanyId.set(companyId, topPerson);
      }
    }
  }

  return topPersonByCompanyId;
};

// A company's last contact mirrors the most recent contact of any of its people,
// so it must be recomputed whenever that set of people changes rather than only
// when an interaction happens.
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
