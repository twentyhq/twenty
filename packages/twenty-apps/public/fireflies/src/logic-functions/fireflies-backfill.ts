import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type z } from 'zod';

import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path.constant';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/logic-functions/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';
import { buildFirefliesBackfillCursor } from 'src/logic-functions/utils/build-fireflies-backfill-cursor.util';
import { resolveRequestBody } from 'src/logic-functions/utils/resolve-request-body.util';

type FirefliesBackfillRequestBody = z.infer<
  typeof firefliesBackfillRequestBodySchema
>;

const firefliesBackfillRequestHandler = async (
  payload:
    | RoutePayload<FirefliesBackfillRequestBody>
    | FirefliesBackfillRequestBody,
): Promise<FirefliesBackfillResult> => {
  const requestBodyParseResult = firefliesBackfillRequestBodySchema.safeParse(
    resolveRequestBody(payload),
  );

  if (!requestBodyParseResult.success) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.INVALID_REQUEST,
      error:
        'Fireflies backfill requires a continuation cursor or a positive days window',
    };
  }

  const requestBody = requestBodyParseResult.data;

  const cursor =
    'cursor' in requestBody
      ? requestBody.cursor
      : buildFirefliesBackfillCursor({
          windowDays: requestBody.days,
          nowMilliseconds: Date.now(),
        });

  return firefliesBackfillHandler({ cursor });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-backfill',
  description:
    'Imports Fireflies calls missing from CallRecording records for the requested days window, enqueueing a continuation job per page until the window is swept.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesBackfillRequestHandler,
  httpRouteTriggerSettings: {
    path: FIREFLIES_BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
