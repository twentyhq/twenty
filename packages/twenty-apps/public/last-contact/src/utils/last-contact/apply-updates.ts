import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { chunk } from 'src/utils/last-contact/chunk';
import { UPDATE_BATCH_SIZE } from 'src/utils/last-contact/page-size';
import { type RecordUpdate } from 'src/utils/last-contact/types';

export const applyUpdates = async (
  client: CoreApiClient,
  mutationName: string,
  updates: RecordUpdate[],
): Promise<void> => {
  for (const batch of chunk(updates, UPDATE_BATCH_SIZE)) {
    await Promise.all(
      batch.map(({ id, data }) =>
        executeWithRetry(() =>
          client.mutation({
            [mutationName]: {
              __args: { id, data },
              id: true,
            },
          }),
        ),
      ),
    );
  }
};
