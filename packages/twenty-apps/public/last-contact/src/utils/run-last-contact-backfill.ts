import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  type BackfillPhase,
  BACKFILL_PHASE_ORDER,
} from 'src/constants/backfill';
import { backfillCompaniesLastContact } from 'src/utils/backfill-companies-last-contact';
import {
  backfillOpportunitiesLastContact,
  type OpportunityNode,
} from 'src/utils/backfill-opportunities-last-contact';
import { backfillPeopleLastContact } from 'src/utils/backfill-people-last-contact';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';

// A total order over createdAt then id keeps the cursor stable while the
// backfill runs: records created meanwhile sort to the tail.
const BACKFILL_ORDER_BY = [
  { createdAt: 'AscNullsFirst' },
  { id: 'AscNullsFirst' },
];

export type BackfillPhaseResult = { phase: BackfillPhase; count: number };

const backfillRecordsInBatches = async <TRecord extends { id: string }>({
  client,
  queryField,
  recordSelection,
  batchSize,
  backfillBatch,
}: {
  client: CoreApiClient;
  queryField: string;
  recordSelection: Record<keyof TRecord, true>;
  batchSize: number;
  backfillBatch: (records: TRecord[]) => Promise<void>;
}): Promise<number> => {
  let count = 0;
  let after: string | undefined;

  do {
    const result = await executeWithRetry(() =>
      client.query({
        [queryField]: {
          __args: { first: batchSize, after, orderBy: BACKFILL_ORDER_BY },
          edges: { node: recordSelection },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );
    const connection = result?.[queryField];
    const records: TRecord[] = (connection?.edges ?? []).map(
      (edge: { node: TRecord }) => edge.node,
    );

    if (records.length > 0) {
      await backfillBatch(records);
      count += records.length;
    }

    after = connection?.pageInfo.hasNextPage
      ? (connection.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return count;
};

const BACKFILL_PHASE_RUNNERS: Record<
  BackfillPhase,
  (client: CoreApiClient, batchSize: number) => Promise<number>
> = {
  people: (client, batchSize) =>
    backfillRecordsInBatches<{ id: string }>({
      client,
      queryField: 'people',
      recordSelection: { id: true },
      batchSize,
      backfillBatch: (people) =>
        backfillPeopleLastContact(
          client,
          people.map(({ id }) => id),
        ),
    }),
  opportunities: (client, batchSize) =>
    backfillRecordsInBatches<OpportunityNode>({
      client,
      queryField: 'opportunities',
      recordSelection: { id: true, pointOfContactId: true },
      batchSize,
      backfillBatch: (opportunities) =>
        backfillOpportunitiesLastContact(client, opportunities),
    }),
  companies: (client, batchSize) =>
    backfillRecordsInBatches<{ id: string }>({
      client,
      queryField: 'companies',
      recordSelection: { id: true },
      batchSize,
      backfillBatch: (companies) =>
        backfillCompaniesLastContact(
          client,
          companies.map(({ id }) => id),
        ),
    }),
};

// Processes every batch in this execution, one after the other, so the
// backfill's API calls stay sequential instead of spreading across concurrent
// jobs that compete for the same rate limit.
export const runLastContactBackfill = async (
  client: CoreApiClient,
): Promise<BackfillPhaseResult[]> => {
  const batchSize = getBackfillBatchSize();
  const results: BackfillPhaseResult[] = [];

  for (const phase of BACKFILL_PHASE_ORDER) {
    const count = await BACKFILL_PHASE_RUNNERS[phase](client, batchSize);

    console.log(`Backfilled last contact on ${count} ${phase}`);
    results.push({ phase, count });
  }

  return results;
};
