import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-logic-function-universal-identifier';
import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { createRetryingCoreApiClient } from 'src/logic-functions/data/create-retrying-core-api-client.util';
import { findCallRecordingIdsForCalendarEvents } from 'src/logic-functions/data/find-call-recording-ids-for-calendar-events.util';
import { enqueueCallRecordingSummariesBackfill } from 'src/logic-functions/flows/enqueue-call-recording-summaries-backfill.util';
import { generateCallRecordingSummariesForIds } from 'src/logic-functions/flows/generate-call-recording-summaries-for-ids.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';
import { toIdList } from 'src/logic-functions/utils/to-id-list.util';

type GenerateCallRecordingSummariesRouteBody = {
  callRecordingIds?: string[];
  calendarEventIds?: string[];
};

const hasOwnProperty = (
  body: GenerateCallRecordingSummariesRouteBody | null | undefined,
  propertyName: keyof GenerateCallRecordingSummariesRouteBody,
): boolean => Object.prototype.hasOwnProperty.call(body ?? {}, propertyName);

export const generateCallRecordingSummariesHandler = async (
  payload: RoutePayload<GenerateCallRecordingSummariesRouteBody>,
): Promise<object> => {
  if (!isCallRecordingSummaryEnabled()) {
    return { outcome: 'disabled' };
  }

  const client = createRetryingCoreApiClient();

  const requestedCallRecordingIds = toIdList(payload.body?.callRecordingIds);
  const requestedCalendarEventIds = toIdList(payload.body?.calendarEventIds);
  const hasRequestedIds =
    hasOwnProperty(payload.body, 'callRecordingIds') ||
    hasOwnProperty(payload.body, 'calendarEventIds');

  if (!hasRequestedIds) {
    const { callRecordingCount, batchCount } =
      await enqueueCallRecordingSummariesBackfill({ client });

    if (callRecordingCount === 0) {
      return { outcome: 'nothing-to-summarize' };
    }

    return { outcome: 'backfill-enqueued', callRecordingCount, batchCount };
  }

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
    'Generates missing AI summaries for call recordings. Called with explicit call recording or calendar event ids for on-demand generation, or with no ids to enqueue a backfill of this app’s recordings that have a transcript but no summary.',
  timeoutSeconds: 900,
  handler: generateCallRecordingSummariesHandler,
  httpRouteTriggerSettings: {
    path: GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
