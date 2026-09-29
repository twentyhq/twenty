import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { SEND_CALL_RECORDER_NOW_ROUTE_PATH } from 'src/constants/send-call-recorder-now-route-path';
import { SEND_CALL_RECORDER_NOW_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { sendCallRecorderNow } from 'src/logic-functions/flows/send-call-recorder-now.util';
import { toIdList } from 'src/logic-functions/utils/to-id-list.util';

type SendCallRecorderNowRouteBody = {
  calendarEventIds?: string[];
};

export const sendCallRecorderNowHandler = async (
  payload: RoutePayload<SendCallRecorderNowRouteBody>,
): Promise<object> => {
  const calendarEventIds = toIdList(payload.body?.calendarEventIds);

  if (calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  // The recorder joins one live meeting; a bulk send would put bots into several calls at once.
  if (calendarEventIds.length > 1) {
    return { outcome: 'single-calendar-event-required' };
  }

  const { status, ...details } = await sendCallRecorderNow({
    client: new CoreApiClient(),
    calendarEventId: calendarEventIds[0],
    now: new Date(),
  });

  return { outcome: status, ...details };
};

export default defineLogicFunction({
  universalIdentifier:
    SEND_CALL_RECORDER_NOW_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'send-call-recorder-now',
  description:
    "Sends the recording bot into a calendar event's meeting right away, replacing the bot scheduled for the regular join time or requesting one when the meeting has none.",
  timeoutSeconds: 60,
  handler: sendCallRecorderNowHandler,
  httpRouteTriggerSettings: {
    path: SEND_CALL_RECORDER_NOW_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
