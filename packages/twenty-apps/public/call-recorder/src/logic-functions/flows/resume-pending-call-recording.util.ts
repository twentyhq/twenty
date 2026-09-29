import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { findResumablePendingCallRecording } from 'src/logic-functions/flows/find-resumable-pending-call-recording.util';
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
  const findResult = await findResumablePendingCallRecording({
    client,
    callRecordingId,
    now,
  });

  if (findResult.status === 'skipped') {
    return findResult;
  }

  const { callRecording, calendarEvent } = findResult;

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
  const scheduleResult = await scheduleRecallBotForCallRecording(client, {
    callRecording,
    calendarEvent,
  });

  switch (scheduleResult.status) {
    case 'scheduled':
      return { status: 'scheduled' };
    case 'blocked':
      return { status: 'skipped', reason: scheduleResult.failureReason };
    case 'skipped':
      return { status: 'skipped', reason: scheduleResult.reason };
    case 'failed':
      return { status: 'deferred', reason: 'Recall bot scheduling failed' };
  }
};
