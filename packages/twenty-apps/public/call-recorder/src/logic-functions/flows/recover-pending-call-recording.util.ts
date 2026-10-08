import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { enqueuePreJoinCreditCheck } from 'src/logic-functions/data/enqueue-pre-join-credit-check.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { updatePendingCallRecording } from 'src/logic-functions/data/update-pending-call-recording.util';
import {
  scheduleRecallBotForCallRecording,
  type ScheduleRecallBotForCallRecordingResult,
} from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { findScheduledRecallBotIdsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-ids-by-call-recording-id.util';

export type RecoverPendingCallRecordingResult =
  | { status: 'attached' }
  | ScheduleRecallBotForCallRecordingResult;

export const recoverPendingCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  now,
}: MeetingRecording & {
  client: CoreApiClient;
  now: Date;
}): Promise<RecoverPendingCallRecordingResult> => {
  if (
    canRescheduleCallRecordingWithoutRecallLookup({
      callRecording,
      calendarEvent,
      workspaceId: getCurrentWorkspaceId(),
      now,
    })
  ) {
    return scheduleRecallBotForCallRecording(client, {
      callRecording,
      calendarEvent,
    });
  }

  const lookupResult = await findScheduledRecallBotIdsByCallRecordingId([
    callRecording.id,
  ]);

  // A failed lookup can hide an existing bot; creating one now could duplicate it.
  if (!lookupResult.ok) {
    return { status: 'failed', reason: 'Recall bot lookup failed' };
  }

  const existingExternalBotId = lookupResult.externalBotIdByCallRecordingId.get(
    callRecording.id,
  );

  if (isUndefined(existingExternalBotId)) {
    return scheduleRecallBotForCallRecording(client, {
      callRecording,
      calendarEvent,
    });
  }

  const isAttached = await updatePendingCallRecording({
    client,
    id: callRecording.id,
    data: { externalBotId: existingExternalBotId },
  });

  if (!isAttached) {
    return {
      status: 'skipped',
      reason: 'call recording no longer awaits a bot',
    };
  }

  if (!isUndefined(calendarEvent.startsAt)) {
    await enqueuePreJoinCreditCheck({
      callRecordingId: callRecording.id,
      externalBotId: existingExternalBotId,
      joinAt: computeRecallBotJoinAt(calendarEvent.startsAt),
    });
  }

  return { status: 'attached' };
};
