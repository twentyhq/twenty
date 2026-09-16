import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const QUERY_MAX_RECORDS = 200;

export type UpsertMutationName =
  | 'createPeople'
  | 'createCompanies'
  | 'createOpportunities';

export type RecordUpsert = { id: string } & Record<string, string | null>;

// The API rate limit is consumed once per operation, and updateMany applies a
// single payload to every record it matches. Writing one timestamp per record
// therefore costs one call per record, which is what exhausts the application
// budget during a mailbox sync. createMany with upsert matches on the primary
// key and carries a distinct payload per record, so a whole batch is one call.
// Callers must only pass ids they just read back, since an id matching nothing
// is inserted rather than ignored.
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
