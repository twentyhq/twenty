import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';

export type ResumePendingCallRecordingResult =
  | { status: 'scheduled' }
  | { status: 'skipped'; reason: string }
  | { status: 'deferred'; reason: string };

// Single-recording variant of the recovery sweep: finishes bot scheduling for
// one row that transitioned back to pending. Deferred outcomes are retried by
// the queue and ultimately by the recovery cron.
export const resumePendingCallRecording = async ({
  client,
  callRecordingId,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  now: Date;
}): Promise<ResumePendingCallRecordingResult> => {
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (isUndefined(callRecording)) {
    return { status: 'skipped', reason: 'call recording not found' };
  }

  if (
    callRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.REQUESTED ||
    callRecording.status !== CallRecordingStatus.SCHEDULED ||
    !isUndefined(callRecording.externalBotId)
  ) {
    return { status: 'skipped', reason: 'call recording is not pending' };
  }

  if (isUndefined(callRecording.calendarEventId)) {
    return { status: 'skipped', reason: 'no calendar event attached' };
  }

  const calendarEvent = (
    await fetchCalendarEventsByIds(client, [callRecording.calendarEventId])
  )[0];

  if (isUndefined(calendarEvent)) {
    return { status: 'skipped', reason: 'calendar event not found' };
  }

  if (
    hasMeetingEnded({
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      now,
    })
  ) {
    // The recovery cron owns failing rows whose meeting is over.
    return { status: 'skipped', reason: 'meeting already ended' };
  }

  if (
    canRescheduleCallRecordingWithoutRecallLookup({
      callRecording,
      calendarEvent,
      workspaceId: getCurrentWorkspaceId(),
      now,
    })
  ) {
    return scheduleBot({ client, callRecording, calendarEvent });
  }

  // Ambiguous attempts need a Recall bot lookup; doing one per event could
  // burst past the shared list budget, so the recovery cron owns them and
  // amortizes a single lookup across all ambiguous rows.
  return {
    status: 'deferred',
    reason: 'ambiguous prior attempt; the recovery cron will reconcile it',
  };
};

const scheduleBot = async ({
  client,
  callRecording,
  calendarEvent,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
}): Promise<ResumePendingCallRecordingResult> => {
  const didScheduleRecallBot = await scheduleRecallBotForCallRecording(
    client,
    {
      callRecording,
      calendarEvent,
    },
  );

  return didScheduleRecallBot
    ? { status: 'scheduled' }
    : { status: 'deferred', reason: 'Recall bot scheduling failed' };
};
