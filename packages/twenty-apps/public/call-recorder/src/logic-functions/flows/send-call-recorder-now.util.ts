import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_BOT_ALREADY_JOINED_STATUS } from 'src/logic-functions/constants/recall-bot-already-joined-status';
import { clearCanceledRecallBot } from 'src/logic-functions/data/clear-canceled-recall-bot.util';
import { createCallRecording } from 'src/logic-functions/data/create-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { reopenCallRecordingRequest } from 'src/logic-functions/data/reopen-call-recording-request.util';
import { setCalendarEventRecordingOn } from 'src/logic-functions/data/set-calendar-event-recording-on.util';
import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { buildScheduledCallRecordingFields } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecorderPolicyNotRequiredReason } from 'src/logic-functions/types/call-recorder-policy-not-required-reason.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

export type SendCallRecorderNowSkipReason =
  | Exclude<CallRecorderPolicyNotRequiredReason, 'PREFERENCE_OFF'>
  | 'CALENDAR_EVENT_NOT_FOUND'
  | 'RECORDING_COMPLETED';

export type SendCallRecorderNowResult =
  | { status: 'sent'; callRecordingId: string }
  | { status: 'already-joined'; callRecordingId: string }
  | { status: 'skipped'; reason: SendCallRecorderNowSkipReason }
  | { status: 'blocked'; failureReason: string }
  | { status: 'failed'; reason: string };

type OpenCallRecordingResolution =
  | { kind: 'open'; callRecording: CallRecordingRecord }
  | { kind: 'settled'; result: SendCallRecorderNowResult };

const LIVE_CALL_RECORDING_STATUSES: readonly string[] = [
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

// The preference flip and the request reopening below both fire the update
// trigger, whose run can win the bot creation with the regular join time; a
// second pass then moves that bot instead of giving up.
const SEND_PASS_COUNT = 2;

// Recall refuses to move a scheduled bot's join time to within ten minutes, so
// sending the recorder now means deleting the scheduled bot and creating an
// ad-hoc one; Recall dispatches an ad-hoc bot at once, which is also what keeps
// later reconciliations from moving it back.
export const sendCallRecorderNow = async ({
  client,
  calendarEventId,
  now,
}: {
  client: CoreApiClient;
  calendarEventId: string;
  now: Date;
}): Promise<SendCallRecorderNowResult> => {
  const calendarEvent = (
    await fetchCalendarEventsByIds(client, [calendarEventId])
  )[0];

  if (isUndefined(calendarEvent)) {
    return { status: 'skipped', reason: 'CALENDAR_EVENT_NOT_FOUND' };
  }

  const policyResult = buildCallRecorderPolicyResult(calendarEvent, now);

  if (!policyResult.shouldRequestBot) {
    if (policyResult.reason !== 'PREFERENCE_OFF') {
      return { status: 'skipped', reason: policyResult.reason };
    }

    // An explicit send overrides the per-meeting Off; without the flip the
    // next reconciliation would cancel the bot this run creates.
    await setCalendarEventRecordingOn(client, calendarEvent.id);
  }

  const callRecordingId = computeCallRecordingIdForMeeting(
    policyResult.realMeetingKey,
  );
  let lastSkipReason = 'the call recording changed while the recorder was sent';

  for (let pass = 0; pass < SEND_PASS_COUNT; pass++) {
    const resolution = await resolveOpenCallRecording({
      client,
      callRecordingId,
      calendarEvent,
    });

    if (resolution.kind === 'settled') {
      return resolution.result;
    }

    const { callRecording } = resolution;
    const replacedExternalBotId = callRecording.externalBotId;

    if (!isUndefined(replacedExternalBotId)) {
      const cancelResult = await cancelRecallBot({
        externalBotId: replacedExternalBotId,
      });

      if (!cancelResult.ok) {
        return cancelResult.status === RECALL_BOT_ALREADY_JOINED_STATUS
          ? { status: 'already-joined', callRecordingId }
          : { status: 'failed', reason: cancelResult.errorMessage };
      }
    }

    const scheduleResult = await scheduleRecallBotForCallRecording(
      client,
      { callRecording, calendarEvent },
      { joinAt: now.toISOString(), replacedExternalBotId },
    );

    switch (scheduleResult.status) {
      case 'scheduled':
        return { status: 'sent', callRecordingId };
      case 'blocked':
        return {
          status: 'blocked',
          failureReason: scheduleResult.failureReason,
        };
      case 'failed':
        if (!isUndefined(replacedExternalBotId)) {
          // The replaced bot is gone; dropping its id lets the update trigger
          // schedule a regular one so the meeting is still recorded.
          await clearCanceledRecallBot(client, {
            callRecordingId,
            externalBotId: replacedExternalBotId,
          });
        }

        return { status: 'failed', reason: scheduleResult.reason };
      case 'skipped':
        lastSkipReason = scheduleResult.reason;
    }
  }

  return { status: 'failed', reason: lastSkipReason };
};

const resolveOpenCallRecording = async ({
  client,
  callRecordingId,
  calendarEvent,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  calendarEvent: CalendarEventRecord;
}): Promise<OpenCallRecordingResolution> => {
  const callRecording =
    (await findCallRecordingsByIds(client, [callRecordingId]))[0] ??
    (await createScheduledCallRecording({
      client,
      callRecordingId,
      calendarEvent,
    }));

  if (callRecording.status === CallRecordingStatus.COMPLETED) {
    return {
      kind: 'settled',
      result: { status: 'skipped', reason: 'RECORDING_COMPLETED' },
    };
  }

  if (LIVE_CALL_RECORDING_STATUSES.includes(callRecording.status ?? '')) {
    return {
      kind: 'settled',
      result: { status: 'already-joined', callRecordingId },
    };
  }

  if (
    callRecording.recordingRequestStatus ===
      CallRecordingRequestStatus.REQUESTED &&
    callRecording.status === CallRecordingStatus.SCHEDULED
  ) {
    return { kind: 'open', callRecording };
  }

  // A canceled, failed or not-recorded request is reopened the way calendar
  // reconciliation does before a bot is requested again.
  const scheduledFields = buildScheduledCallRecordingFields(calendarEvent);
  const isReopened = await reopenCallRecordingRequest(client, {
    callRecordingId,
    scheduledFields,
  });

  if (!isReopened) {
    return {
      kind: 'settled',
      result: {
        status: 'failed',
        reason: 'the call recording changed while its request was reopened',
      },
    };
  }

  return {
    kind: 'open',
    callRecording: {
      ...callRecording,
      ...scheduledFields,
      callRecorderFailureReason: undefined,
    },
  };
};

const createScheduledCallRecording = async ({
  client,
  callRecordingId,
  calendarEvent,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  calendarEvent: CalendarEventRecord;
}): Promise<CallRecordingRecord> => {
  const scheduledFields = buildScheduledCallRecordingFields(calendarEvent);

  try {
    await createCallRecording(client, {
      id: callRecordingId,
      data: scheduledFields,
    });
  } catch (error) {
    // The id is deterministic, so a conflict means a concurrent run created the row first.
    const concurrentlyCreatedCallRecording = (
      await findCallRecordingsByIds(client, [callRecordingId])
    )[0];

    if (isUndefined(concurrentlyCreatedCallRecording)) {
      throw error;
    }

    return concurrentlyCreatedCallRecording;
  }

  return { id: callRecordingId, ...scheduledFields };
};
