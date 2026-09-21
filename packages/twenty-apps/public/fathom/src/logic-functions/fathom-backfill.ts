import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import {
  FATHOM_BACKFILL_MAX_WINDOW_DAYS,
  FATHOM_BACKFILL_ROUTE_PATH,
} from 'src/constants/fathom.constant';
import { FATHOM_BACKFILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueFathomBackfillWorker } from 'src/logic-functions/utils/enqueue-fathom-backfill-worker.util';
import { findFathomConnectionForRequester } from 'src/logic-functions/utils/find-fathom-connection-for-requester.util';

type FathomBackfillResult =
  | { success: true; connectedAccountId: string; days: number }
  | { success: false; error: string };

export const fathomBackfillHandler = async (
  routePayload: RoutePayload<{ days?: unknown }>,
  context: LogicFunctionExecutionContext,
): Promise<FathomBackfillResult> => {
  const days = routePayload.body?.days;

  if (
    typeof days !== 'number' ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > FATHOM_BACKFILL_MAX_WINDOW_DAYS
  ) {
    return {
      success: false,
      error: `Fathom backfill requires a days window between 1 and ${FATHOM_BACKFILL_MAX_WINDOW_DAYS}`,
    };
  }

  const connection = await findFathomConnectionForRequester(context);

  if (!isDefined(connection)) {
    return {
      success: false,
      error:
        'Fathom is not connected for this user. Open the Fathom app settings and add a connection first.',
    };
  }

  await enqueueFathomBackfillWorker({
    connectedAccountId: connection.id,
    days,
  });

  return { success: true, connectedAccountId: connection.id, days };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill',
  description:
    "Starts a Fathom history import through the requesting user's connected account.",
  timeoutSeconds: 15,
  handler: fathomBackfillHandler,
  httpRouteTriggerSettings: {
    path: FATHOM_BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
