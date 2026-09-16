import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const QUERY_MAX_RECORDS = 200;

export type UpsertMutationName =
  | 'createPeople'
  | 'createCompanies'
  | 'createOpportunities';

export type RecordUpsert = { id: string } & Record<string, string | null>;

export const upsertRecordsInBatches = async (
  client: CoreApiClient,
  mutationName: UpsertMutationName,
  records: RecordUpsert[],
): Promise<void> => {
  for (const batch of chunk(records, QUERY_MAX_RECORDS)) {
    await executeWithRetry(() =>
      client.mutation({
        [mutationName]: {
          __args: { data: batch, upsert: true },
          id: true,
        },
      }),
    );
  }
};
