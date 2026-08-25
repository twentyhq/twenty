import { CoreApiClient } from 'twenty-client-sdk/core';
import { getConnection } from 'twenty-sdk/logic-function';

import { FIREFLIES_BACKFILL_BATCH_SIZE } from 'src/logic-functions/constants/fireflies-backfill-batch-size.constant';
import { importMissingFirefliesCalls } from 'src/logic-functions/flows/import-missing-fireflies-calls.util';
import { firefliesBackfillBatchPayloadSchema } from 'src/logic-functions/schemas/fireflies-backfill-batch-payload.schema';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';

export const firefliesBackfillBatchHandler = async (
  payload: unknown,
): Promise<ImportMissingFirefliesCallsResult> => {
  const payloadParseResult =
    firefliesBackfillBatchPayloadSchema.safeParse(payload);

  if (!payloadParseResult.success) {
    throw new Error(
      `Fireflies backfill batch requires 1 to ${FIREFLIES_BACKFILL_BATCH_SIZE} non-empty transcript ids`,
    );
  }

  const connection = await getConnection(payloadParseResult.data.connectionId);

  const importMissingFirefliesCallsResult = await importMissingFirefliesCalls({
    accessToken: connection.accessToken,
    coreApiClient: new CoreApiClient(),
    transcriptIds: payloadParseResult.data.transcriptIds,
  });

  console.log('[fireflies] Backfill batch processed', {
    importedCallCount: importMissingFirefliesCallsResult.importedCallCount,
    erroredCallCount: importMissingFirefliesCallsResult.erroredCallCount,
    skippedCallCount: importMissingFirefliesCallsResult.skippedCallCount,
  });

  if (importMissingFirefliesCallsResult.status === 'retryable-error') {
    throw new Error(
      'Fireflies backfill batch hit a transient Fireflies API error; failing the job so the queue retries it',
    );
  }

  return importMissingFirefliesCallsResult;
};
