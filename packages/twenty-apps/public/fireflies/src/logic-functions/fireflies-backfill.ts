import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type z } from 'zod';

import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path.constant';
import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-backfill-max-window-days.constant';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/logic-functions/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';

type FirefliesBackfillRequestBody = z.infer<
  typeof firefliesBackfillRequestBodySchema
>;

const firefliesBackfillRequestHandler = async (
  payload: RoutePayload<FirefliesBackfillRequestBody>,
): Promise<FirefliesBackfillResult> => {
  const requestBodyParseResult = firefliesBackfillRequestBodySchema.safeParse(
    payload.body,
  );

  if (!requestBodyParseResult.success) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.INVALID_REQUEST,
      error: `Fireflies backfill requires a days window between 1 and ${FIREFLIES_BACKFILL_MAX_WINDOW_DAYS}`,
    };
  }

  return firefliesBackfillHandler({
    windowDays: requestBodyParseResult.data.days,
  });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-backfill',
  description:
    'Lists the Fireflies transcript ids for the requested days window and enqueues one import job per batch.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesBackfillRequestHandler,
  httpRouteTriggerSettings: {
    path: FIREFLIES_BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
