import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  enqueueJob,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_MAX_WINDOW_DAYS } from 'src/constants/fathom.constant';
import { FATHOM_BACKFILL_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-universal-identifier';
import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-worker-universal-identifier';
import { getFathomConnectionForRequest } from 'src/logic-functions/utils/get-fathom-connection-for-request.util';

export const fathomBackfillHandler = async (
  routePayload: RoutePayload<{ days?: number }>,
  context: LogicFunctionExecutionContext,
) => {
  const days = routePayload.body?.days;

  if (
    !Number.isInteger(days) ||
    days === undefined ||
    days < 1 ||
    days > FATHOM_BACKFILL_MAX_WINDOW_DAYS
  ) {
    return {
      success: false,
      error: `Fathom backfill days must be an integer between 1 and ${FATHOM_BACKFILL_MAX_WINDOW_DAYS}`,
    };
  }

  const connection = await getFathomConnectionForRequest(context);

  await enqueueJob({
    logicFunctionUniversalIdentifier:
      FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
    payload: { connectedAccountId: connection.id, days },
    retryLimit: 3,
  });

  return { success: true, started: true };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill',
  description:
    'Starts a Fathom history import using the requesting user\'s connected account permissions.',
  timeoutSeconds: 15,
  handler: fathomBackfillHandler,
  httpRouteTriggerSettings: {
    path: '/fathom/backfill',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
