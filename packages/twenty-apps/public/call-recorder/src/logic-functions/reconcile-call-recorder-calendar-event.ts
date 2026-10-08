import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { CALENDAR_EVENT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/batch-handler-timeout-seconds';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CalendarEventForDatabaseEvent } from 'src/logic-functions/types/calendar-event-for-database-event.type';
import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';
import { buildCalendarEventReconciliationPayload } from 'src/logic-functions/domain/build-calendar-event-reconciliation-payload.util';
import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

const CALENDAR_EVENT_OBJECT_NAME = 'calendarEvent';

type CalendarEventBatchReconciliationResult =
  | { skipped: true; reason: string }
  | {
      reconciled: true;
      calendarEventIds: string[];
      removedOccurrenceCount: number;
      reconciliationResults: CallRecorderReconciliationResult[];
    };

const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordBaseEvent<CalendarEventForDatabaseEvent>
  >,
): Promise<CalendarEventBatchReconciliationResult> => {
  const [objectName, action] = batch.name.split('.');

  if (objectName !== CALENDAR_EVENT_OBJECT_NAME) {
    return { skipped: true, reason: 'not a calendar event' };
  }

  const reconciliationPayload = buildCalendarEventReconciliationPayload({
    action,
    events: batch.events,
  });

  if (
    reconciliationPayload.calendarEventIds.length === 0 &&
    reconciliationPayload.echoCandidateCalendarEventIds.length === 0 &&
    reconciliationPayload.removedOccurrences.length === 0
  ) {
    return { skipped: true, reason: 'no relevant calendar event change' };
  }

  const client = new CoreApiClient({ fetch: fetchWithRateLimitRetry });
  const calendarEventIds = await resolveCalendarEventIdsToReconcile({
    client,
    changedCalendarEventIds: reconciliationPayload.calendarEventIds,
    echoCandidateCalendarEventIds:
      reconciliationPayload.echoCandidateCalendarEventIds,
  });

  if (
    calendarEventIds.length === 0 &&
    reconciliationPayload.removedOccurrences.length === 0
  ) {
    return {
      skipped: true,
      reason: 'preference change on a meeting whose bot is already requested',
    };
  }

  const reconciliationResults = await reconcileCallRecorderForCalendarEventIds({
    client,
    calendarEventIds,
    removedOccurrences: reconciliationPayload.removedOccurrences,
  });

  return {
    reconciled: true,
    calendarEventIds,
    removedOccurrenceCount: reconciliationPayload.removedOccurrences.length,
    reconciliationResults,
  };
};

const resolveCalendarEventIdsToReconcile = async ({
  client,
  changedCalendarEventIds,
  echoCandidateCalendarEventIds,
}: {
  client: CoreApiClient;
  changedCalendarEventIds: string[];
  echoCandidateCalendarEventIds: string[];
}): Promise<string[]> => {
  const calendarEventIdsWithRecordingOnAlreadyHonored =
    await findCalendarEventIdsWithRecordingOnAlreadyHonored(
      client,
      echoCandidateCalendarEventIds,
    );

  return getUniqueSortedIds([
    ...changedCalendarEventIds,
    ...echoCandidateCalendarEventIds.filter(
      (calendarEventId) =>
        !calendarEventIdsWithRecordingOnAlreadyHonored.includes(
          calendarEventId,
        ),
    ),
  ]);
};

const findCalendarEventIdsWithRecordingOnAlreadyHonored = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<string[]> => {
  const now = new Date();
  const requestingCalendarEvents = (
    await fetchCalendarEventsByIds(client, calendarEventIds)
  )
    .map((calendarEvent) => buildCallRecorderPolicyResult(calendarEvent, now))
    .filter((policyResult) => policyResult.shouldRequestBot)
    .map((policyResult) => ({
      calendarEventId: policyResult.calendarEventId,
      callRecordingId: computeCallRecordingIdForMeeting(
        policyResult.realMeetingKey,
      ),
    }));
  const requestedCallRecordingIds = new Set(
    (
      await findCallRecordingsByIds(
        client,
        getUniqueSortedIds(
          requestingCalendarEvents.map(
            (requestingCalendarEvent) =>
              requestingCalendarEvent.callRecordingId,
          ),
        ),
      )
    )
      .filter(
        (callRecording) =>
          callRecording.recordingRequestStatus ===
            CallRecordingRequestStatus.REQUESTED &&
          !isUnavailableCallRecordingStatus(callRecording.status),
      )
      .map((callRecording) => callRecording.id),
  );

  return requestingCalendarEvents
    .filter((requestingCalendarEvent) =>
      requestedCallRecordingIds.has(requestingCalendarEvent.callRecordingId),
    )
    .map((requestingCalendarEvent) => requestingCalendarEvent.calendarEventId);
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recorder-calendar-event',
  description:
    'Reconciles app-managed Recall bot recording requests when calendar events change.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler,
  databaseEventTriggerSettings: {
    eventName: `${CALENDAR_EVENT_OBJECT_NAME}.*`,
    updatedFields: [
      'title',
      'callRecorderPreference',
      'conferenceLink',
      'location',
      'description',
      'startsAt',
      'endsAt',
      'isCanceled',
      'iCalUid',
    ],
    batchMode: true,
  },
});
