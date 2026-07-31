import { CoreApiClient } from 'twenty-client-sdk/core';

import { FIREFLIES_BACKFILL_CONTINUATION_BACKOFF_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-continuation-backoff-milliseconds.constant';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/logic-functions/constants/fireflies-backfill-outcome.constant';
import { enqueueFirefliesBackfillContinuation } from 'src/logic-functions/data/enqueue-fireflies-backfill-continuation.util';
import { importMissingFirefliesCalls } from 'src/logic-functions/flows/import-missing-fireflies-calls.util';
import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';

export const firefliesBackfillHandler = async ({
  cursor,
}: {
  cursor: FirefliesBackfillCursor;
}): Promise<FirefliesBackfillResult> => {
  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED,
      error: apiKeyResult.error,
    };
  }

  const importMissingFirefliesCallsResult = await importMissingFirefliesCalls({
    apiKey: apiKeyResult.apiKey,
    coreApiClient: new CoreApiClient(),
    cursor,
  });

  if (importMissingFirefliesCallsResult.stopReason === 'exhausted') {
    const { stopReason: _stopReason, ...backfillRunResult } =
      importMissingFirefliesCallsResult;

    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.COMPLETED,
      fromDate: cursor.fromDate,
      isContinuationEnqueued: false,
      ...backfillRunResult,
    };
  }

  if (importMissingFirefliesCallsResult.stopReason === 'list-failed') {
    const { stopReason: _stopReason, ...backfillRunResult } =
      importMissingFirefliesCallsResult;

    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.LIST_FAILED,
      fromDate: cursor.fromDate,
      isContinuationEnqueued: false,
      ...backfillRunResult,
    };
  }

  const { stopReason, ...backfillRunResult } =
    importMissingFirefliesCallsResult;
  const isContinuationEnqueued = await enqueueFirefliesBackfillContinuation({
    cursor: importMissingFirefliesCallsResult.continuationCursor,
    ...(stopReason === 'page-complete'
      ? {}
      : { delayMs: FIREFLIES_BACKFILL_CONTINUATION_BACKOFF_MILLISECONDS }),
  });

  if (stopReason === 'rate-limited') {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.RATE_LIMITED,
      fromDate: cursor.fromDate,
      isContinuationEnqueued,
      ...backfillRunResult,
    };
  }

  if (isContinuationEnqueued) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.CONTINUATION_ENQUEUED,
      fromDate: cursor.fromDate,
      isContinuationEnqueued: true,
      ...backfillRunResult,
    };
  }

  return {
    outcome: FIREFLIES_BACKFILL_OUTCOME.CONTINUATION_ENQUEUE_FAILED,
    fromDate: cursor.fromDate,
    isContinuationEnqueued: false,
    ...backfillRunResult,
  };
};
