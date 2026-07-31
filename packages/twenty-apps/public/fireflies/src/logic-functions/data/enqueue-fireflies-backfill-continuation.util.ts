import { enqueueJob } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-continuation-retry-limit.constant';
import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';

export const enqueueFirefliesBackfillContinuation = async ({
  cursor,
  delayMs,
}: {
  cursor: FirefliesBackfillCursor;
  delayMs?: number;
}): Promise<boolean> => {
  try {
    await enqueueJob({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { cursor },
      retryLimit: FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT,
      ...(isDefined(delayMs) ? { delayMs } : {}),
    });

    return true;
  } catch (error) {
    console.error(
      `[fireflies] backfill continuation enqueue failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return false;
  }
};
