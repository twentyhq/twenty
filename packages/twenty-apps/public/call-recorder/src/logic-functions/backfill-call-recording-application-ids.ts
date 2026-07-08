import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { BACKFILL_CALL_RECORDING_APPLICATION_IDS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-application-ids-logic-function-universal-identifier';
import { BACKFILL_CALL_RECORDING_APPLICATION_IDS_ROUTE_PATH } from 'src/constants/backfill-call-recording-application-ids-route-path';
import { backfillCallRecordingApplicationIds } from 'src/logic-functions/flows/backfill-call-recording-application-ids.util';

const TIMEOUT_SECONDS = 900;

export const backfillCallRecordingApplicationIdsHandler = async (
  _payload: RoutePayload<object>,
): Promise<object> => {
  const client = new CoreApiClient();

  const result = await backfillCallRecordingApplicationIds(client);

  return { outcome: 'processed', ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_CALL_RECORDING_APPLICATION_IDS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-call-recording-application-ids',
  description:
    "Stamps this app's universal identifier onto the call recordings it created before applicationId was set at creation time. Ownership is inferred from the createdBy actor since legacy rows have no applicationId yet.",
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: backfillCallRecordingApplicationIdsHandler,
  httpRouteTriggerSettings: {
    path: BACKFILL_CALL_RECORDING_APPLICATION_IDS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
