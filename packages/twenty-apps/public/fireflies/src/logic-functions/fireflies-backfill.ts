import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path.constant';
import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/constants/fireflies-backfill-max-window-days.constant';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';
import { startFirefliesBackfillWorkers } from 'src/logic-functions/utils/start-fireflies-backfill-workers.util';

const firefliesBackfillRequestHandler = async (
  payload: RoutePayload<unknown>,
) => {
  const requestBodyParseResult = firefliesBackfillRequestBodySchema.safeParse(
    payload.body,
  );

  if (!requestBodyParseResult.success) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.INVALID_REQUEST,
      error: `Fireflies backfill requires a days window between 1 and ${FIREFLIES_BACKFILL_MAX_WINDOW_DAYS}`,
    };
  }

  return startFirefliesBackfillWorkers({
    days: requestBodyParseResult.data.days,
  });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-backfill',
  description:
    'Starts one background history-discovery worker per connected Fireflies account for the requested days window.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesBackfillRequestHandler,
  httpRouteTriggerSettings: {
    path: FIREFLIES_BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
