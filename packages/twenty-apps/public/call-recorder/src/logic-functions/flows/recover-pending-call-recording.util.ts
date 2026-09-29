import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { enqueuePreJoinCreditCheck } from 'src/logic-functions/data/enqueue-pre-join-credit-check.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { findResumablePendingCallRecording } from 'src/logic-functions/flows/find-resumable-pending-call-recording.util';
import {
  scheduleRecallBotForCallRecording,
  type ScheduleRecallBotForCallRecordingResult,
} from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { findScheduledRecallBotIdsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-ids-by-call-recording-id.util';

export type RecoverPendingCallRecordingResult =
  | { status: 'attached' }
  | ScheduleRecallBotForCallRecordingResult;

// Throws when Recall's answer is unknown, so the queue retries this recording alone.
export const recoverPendingCallRecording = async ({
  client,
  callRecordingId,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  now: Date;
}): Promise<RecoverPendingCallRecordingResult> => {
  const findResult = await findResumablePendingCallRecording({
    client,
    callRecordingId,
    now,
  });

  if (findResult.status === 'skipped') {
    return findResult;
  }

  const { callRecording, calendarEvent } = findResult;
  const existingExternalBotId = canRescheduleCallRecordingWithoutRecallLookup({
    callRecording,
    calendarEvent,
    workspaceId: getCurrentWorkspaceId(),
    now,
  })
    ? undefined
    : await findExistingExternalBotIdOrThrow(callRecording.id);

  if (!isUndefined(existingExternalBotId)) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: { externalBotId: existingExternalBotId },
    });

    if (!isUndefined(calendarEvent.startsAt)) {
      await enqueuePreJoinCreditCheck({
        callRecordingId: callRecording.id,
        externalBotId: existingExternalBotId,
        joinAt: computeRecallBotJoinAt(calendarEvent.startsAt),
      });
    }

    return { status: 'attached' };
  }

  const scheduleResult = await scheduleRecallBotForCallRecording(client, {
    callRecording,
    calendarEvent,
  });

  if (scheduleResult.status === 'failed') {
    throw new Error(scheduleResult.reason);
  }

  return scheduleResult;
};

const findExistingExternalBotIdOrThrow = async (
  callRecordingId: string,
): Promise<string | undefined> => {
  const lookupResult = await findScheduledRecallBotIdsByCallRecordingId([
    callRecordingId,
  ]);

  if (!lookupResult.ok) {
    throw new Error('Recall bot lookup failed');
  }

  return lookupResult.externalBotIdByCallRecordingId.get(callRecordingId);
};
