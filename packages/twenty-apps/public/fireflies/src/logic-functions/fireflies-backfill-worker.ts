import { defineLogicFunction } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';

const firefliesBackfillWorkerHandler = async (
  payload: unknown,
): Promise<FirefliesBackfillResult> => {
  const payloadParseResult =
    firefliesBackfillRequestBodySchema.safeParse(payload);

  if (!payloadParseResult.success) {
    throw new Error('Fireflies backfill worker requires a valid days window');
  }

  const firefliesBackfillResult = await firefliesBackfillHandler({
    windowDays: payloadParseResult.data.days,
  });

  console.log(
    '[fireflies] Backfill discovery finished',
    firefliesBackfillResult,
  );

  return firefliesBackfillResult;
};

export default defineLogicFunction({
  universalIdentifier:
    FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-backfill-worker',
  description:
    'Lists Fireflies transcript ids for a requested window and enqueues one import job per batch.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesBackfillWorkerHandler,
});
