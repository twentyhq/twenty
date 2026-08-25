import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';

import {
  FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path.constant';
import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/constants/fireflies-backfill-max-window-days.constant';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';

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

  const connections = await listConnections({
    providerName: 'fireflies',
    visibility: 'workspace',
  });

  if (connections.length === 0) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED,
      error:
        'Fireflies is not configured. Add at least one workspace-shared Fireflies connection.',
    };
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: connections.map((connection) => ({
      connectionId: connection.id,
      days: requestBodyParseResult.data.days,
    })),
  });

  return {
    outcome: FIREFLIES_BACKFILL_OUTCOME.STARTED,
    connectionCount: connections.length,
  };
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
