import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { findCallRecordingIdsForCalendarEvents } from 'src/logic-functions/data/find-call-recording-ids-for-calendar-events.util';
import { generateCallRecordingSummariesForIds } from 'src/logic-functions/flows/generate-call-recording-summaries-for-ids.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';
import { toIdList } from 'src/logic-functions/utils/to-id-list.util';

type GenerateCallRecordingSummariesRouteBody = {
  callRecordingIds?: string[];
  calendarEventIds?: string[];
};

export const generateCallRecordingSummariesHandler = async (
  payload: RoutePayload<GenerateCallRecordingSummariesRouteBody>,
): Promise<object> => {
  if (!isCallRecordingSummaryEnabled()) {
    return { outcome: 'disabled' };
  }

  const client = new CoreApiClient();

  const requestedCallRecordingIds = toIdList(payload.body?.callRecordingIds);
  const requestedCalendarEventIds = toIdList(payload.body?.calendarEventIds);

  if (
    requestedCallRecordingIds.length === 0 &&
    requestedCalendarEventIds.length === 0
  ) {
    return { outcome: 'nothing-selected' };
  }

  let callRecordingIds = requestedCallRecordingIds;

  if (callRecordingIds.length === 0) {
    callRecordingIds = await findCallRecordingIdsForCalendarEvents(client, {
      calendarEventIds: requestedCalendarEventIds,
    });

    if (callRecordingIds.length === 0) {
      return { outcome: 'no-call-recordings-for-calendar-events' };
    }
  }

  const result = await generateCallRecordingSummariesForIds({
    client,
    callRecordingIds,
  });

  return { outcome: 'processed', ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-call-recording-summaries',
  description:
    'Generates or regenerates AI summaries on demand for the requested call recordings or for the recordings of the requested calendar events.',
  timeoutSeconds: 900,
  handler: generateCallRecordingSummariesHandler,
  httpRouteTriggerSettings: {
    path: GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
