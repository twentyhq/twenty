import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-logic-function-universal-identifier';
import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { findCallRecordingIdsForCalendarEvents } from 'src/logic-functions/data/find-call-recording-ids-for-calendar-events.util';
import { findCallRecordingIdsMissingSummary } from 'src/logic-functions/data/find-call-recording-ids-missing-summary.util';
import { generateMissingCallRecordingSummaries } from 'src/logic-functions/flows/generate-missing-call-recording-summaries.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TIMEOUT_SECONDS = 900;
const CONTINUATION_RESERVE_MS = 30_000;

type GenerateCallRecordingSummariesRouteBody = {
  callRecordingIds?: string[];
  calendarEventIds?: string[];
};

const hasOwnProperty = <T extends object>(
  object: T | null | undefined,
  propertyName: keyof GenerateCallRecordingSummariesRouteBody,
): boolean =>
  object === undefined || object === null
    ? false
    : Object.prototype.hasOwnProperty.call(object, propertyName);

const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

export const generateCallRecordingSummariesHandler = async (
  payload: RoutePayload<GenerateCallRecordingSummariesRouteBody>,
): Promise<object> => {
  if (!isCallRecordingSummaryEnabled()) {
    return { outcome: 'disabled' };
  }

  const startedAtMs = Date.now();
  const client = new CoreApiClient();

  const requestedCallRecordingIds = toIdList(payload.body?.callRecordingIds);
  const requestedCalendarEventIds = toIdList(payload.body?.calendarEventIds);
  const hasRequestedCallRecordingIds = hasOwnProperty(
    payload.body,
    'callRecordingIds',
  );
  const hasRequestedCalendarEventIds = hasOwnProperty(
    payload.body,
    'calendarEventIds',
  );
  const hasRequestedIds =
    hasRequestedCallRecordingIds || hasRequestedCalendarEventIds;

  let callRecordingIds = requestedCallRecordingIds;

  if (
    hasRequestedIds &&
    requestedCallRecordingIds.length === 0 &&
    requestedCalendarEventIds.length === 0
  ) {
    return { outcome: 'nothing-selected' };
  }

  if (callRecordingIds.length === 0 && requestedCalendarEventIds.length > 0) {
    callRecordingIds = await findCallRecordingIdsForCalendarEvents(client, {
      calendarEventIds: requestedCalendarEventIds,
    });

    if (callRecordingIds.length === 0) {
      return { outcome: 'no-call-recordings-for-calendar-events' };
    }
  }

  const isSweep = !hasRequestedIds;

  if (isSweep) {
    callRecordingIds = await findCallRecordingIdsMissingSummary(client);

    if (callRecordingIds.length === 0) {
      return { outcome: 'nothing-to-summarize' };
    }
  }

  const result = await generateMissingCallRecordingSummaries({
    client,
    callRecordingIds,
    deadlineAtMs:
      startedAtMs + TIMEOUT_SECONDS * 1000 - CONTINUATION_RESERVE_MS,
  });

  return { outcome: 'processed', ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-call-recording-summaries',
  description:
    'Generates missing AI summaries for call recordings. Called with explicit call recording or calendar event ids for on-demand generation, or with no ids to sweep this app’s recordings that have a transcript but no summary; re-invokes itself with the remaining ids when a batch approaches the timeout.',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: generateCallRecordingSummariesHandler,
  httpRouteTriggerSettings: {
    path: GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
