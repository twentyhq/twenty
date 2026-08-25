import { defineLogicFunction } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { firefliesBackfillWorkerPayloadSchema } from 'src/logic-functions/schemas/fireflies-backfill-worker-payload.schema';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';

const firefliesBackfillWorkerHandler = async (
  payload: unknown,
): Promise<FirefliesBackfillResult> => {
  const payloadParseResult =
    firefliesBackfillWorkerPayloadSchema.safeParse(payload);

  if (!payloadParseResult.success) {
    throw new Error(
      'Fireflies backfill worker requires a connection id and valid days window',
    );
  }

  const firefliesBackfillResult = await firefliesBackfillHandler({
    connectionId: payloadParseResult.data.connectionId,
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
    'Lists transcript ids from one connected Fireflies account for a requested window and enqueues one connection-bound import job per batch.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesBackfillWorkerHandler,
});
