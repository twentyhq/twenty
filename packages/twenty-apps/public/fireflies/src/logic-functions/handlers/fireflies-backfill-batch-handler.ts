import { CoreApiClient } from 'twenty-client-sdk/core';

import { importMissingFirefliesCalls } from 'src/logic-functions/flows/import-missing-fireflies-calls.util';
import { firefliesBackfillBatchPayloadSchema } from 'src/logic-functions/schemas/fireflies-backfill-batch-payload.schema';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';

export const firefliesBackfillBatchHandler = async (
  payload: unknown,
): Promise<ImportMissingFirefliesCallsResult> => {
  const payloadParseResult =
    firefliesBackfillBatchPayloadSchema.safeParse(payload);

  if (!payloadParseResult.success) {
    throw new Error(
      'Fireflies backfill batch requires a non-empty transcriptIds list',
    );
  }

  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    throw new Error(apiKeyResult.error);
  }

  const importMissingFirefliesCallsResult = await importMissingFirefliesCalls({
    apiKey: apiKeyResult.apiKey,
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
