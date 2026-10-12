import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { computeCallRecordingRequestFollowUpRetryDelayMs } from 'src/logic-functions/domain/compute-call-recording-request-follow-up-retry-delay.util';
import {
  resolveCallRecordingRequestFollowUp,
  type CallRecordingRequestFollowUp,
} from 'src/logic-functions/domain/resolve-call-recording-request-follow-up.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { replaceCanceledCallRecordingExternalBotId } from 'src/logic-functions/data/replace-canceled-call-recording-external-bot-id.util';
import { updatePendingCallRecording } from 'src/logic-functions/data/update-pending-call-recording.util';
import { cancelRecallBotForCanceledCallRecording } from 'src/logic-functions/flows/cancel-recall-bot-for-canceled-call-recording.util';
import {
  recoverPendingCallRecording,
  type RecoverPendingCallRecordingResult,
} from 'src/logic-functions/flows/recover-pending-call-recording.util';
import { findScheduledRecallBotIdsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-ids-by-call-recording-id.util';

export type FollowUpCallRecordingRequestResult =
  | { status: 'settled'; outcome: string }
  | { status: 'follow-up-again'; reason: string; dueAt: Date };

type FollowUpActionResult =
  | { status: 'done'; outcome: string }
  | { status: 'failed'; reason: string };

export const followUpCallRecordingRequest = async ({
  client,
  callRecordingId,
  attempt,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  attempt: number;
  now: Date;
}): Promise<FollowUpCallRecordingRequestResult> => {
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (isUndefined(callRecording)) {
    return { status: 'settled', outcome: 'call recording not found' };
  }

  const calendarEvent = isUndefined(callRecording.calendarEventId)
    ? undefined
    : (
        await fetchCalendarEventsByIds(client, [callRecording.calendarEventId])
      )[0];
  const followUp = resolveCallRecordingRequestFollowUp({
    callRecording,
    calendarEvent,
    now,
  });

  if (followUp.action === 'check-again') {
    return {
      status: 'follow-up-again',
      reason: followUp.reason,
      dueAt: followUp.checkAt,
    };
  }

  const actionResult = await runFollowUpAction({
    client,
    callRecording,
    followUp,
    now,
  });

  if (actionResult.status === 'failed') {
    return {
      status: 'follow-up-again',
      reason: actionResult.reason,
      dueAt: new Date(
        now.getTime() +
          computeCallRecordingRequestFollowUpRetryDelayMs({
            attempt,
            meetingStartsAt: calendarEvent?.startsAt,
            now,
          }),
      ),
    };
  }

  return { status: 'settled', outcome: actionResult.outcome };
};

const runFollowUpAction = async ({
  client,
  callRecording,
  followUp,
  now,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  followUp: Exclude<CallRecordingRequestFollowUp, { action: 'check-again' }>;
  now: Date;
}): Promise<FollowUpActionResult> => {
  switch (followUp.action) {
    case 'none':
      return { status: 'done', outcome: followUp.reason };
    case 'book-bot':
      return bookRecallBot({
        client,
        callRecording,
        calendarEvent: followUp.calendarEvent,
        now,
      });
    case 'mark-failed':
      return markCallRecordingFailed({
        client,
        callRecordingId: callRecording.id,
        failureReason: followUp.failureReason,
      });
    case 'cancel-bot':
      return cancelLeftoverRecallBot({
        client,
        callRecordingId: callRecording.id,
        externalBotId: followUp.externalBotId,
      });
    case 'find-and-cancel-bot':
      return findAndCancelLeftoverRecallBot({
        client,
        callRecordingId: callRecording.id,
      });
  }
};

const bookRecallBot = async ({
  client,
  callRecording,
  calendarEvent,
  now,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  now: Date;
}): Promise<FollowUpActionResult> => {
  const recoverResult = await recoverPendingCallRecording({
    client,
    callRecording,
    calendarEvent,
    now,
  });

  if (recoverResult.status === 'failed') {
    return { status: 'failed', reason: recoverResult.reason };
  }

  return { status: 'done', outcome: describeRecovery(recoverResult) };
};

const describeRecovery = (
  recoverResult: Exclude<
    RecoverPendingCallRecordingResult,
    { status: 'failed' }
  >,
): string => {
  switch (recoverResult.status) {
    case 'attached':
      return 'attached the Recall bot found for the request';
    case 'scheduled':
      return 'scheduled a Recall bot';
    case 'skipped':
      return recoverResult.reason;
    case 'blocked':
      return recoverResult.failureReason;
  }
};

const markCallRecordingFailed = async ({
  client,
  callRecordingId,
  failureReason,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  failureReason: string;
}): Promise<FollowUpActionResult> => {
  const isMarkedFailed = await updatePendingCallRecording({
    client,
    id: callRecordingId,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: failureReason,
    },
  });

  if (!isMarkedFailed) {
    return { status: 'done', outcome: 'request changed before it failed' };
  }

  console.warn(
    `[call-recorder] call recording ${callRecordingId} got no Recall bot before its meeting ended; marked it failed (${failureReason})`,
  );

  return { status: 'done', outcome: failureReason };
};

const cancelLeftoverRecallBot = async ({
  client,
  callRecordingId,
  externalBotId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string;
}): Promise<FollowUpActionResult> => {
  const cancelOutcome = await cancelRecallBotForCanceledCallRecording({
    client,
    callRecordingId,
    externalBotId,
  });

  if (cancelOutcome === 'failed') {
    return { status: 'failed', reason: 'Recall bot cancellation failed' };
  }

  return {
    status: 'done',
    outcome: `Recall bot cancellation ${cancelOutcome}`,
  };
};

const findAndCancelLeftoverRecallBot = async ({
  client,
  callRecordingId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
}): Promise<FollowUpActionResult> => {
  const lookupResult = await findScheduledRecallBotIdsByCallRecordingId([
    callRecordingId,
  ]);

  if (!lookupResult.ok) {
    return { status: 'failed', reason: 'Recall bot lookup failed' };
  }

  const externalBotId =
    lookupResult.externalBotIdByCallRecordingId.get(callRecordingId);

  if (isUndefined(externalBotId)) {
    return { status: 'done', outcome: 'no Recall bot left to cancel' };
  }

  const isClaimed = await replaceCanceledCallRecordingExternalBotId(client, {
    id: callRecordingId,
    expectedExternalBotId: null,
    nextExternalBotId: externalBotId,
  });

  // Another writer saved a bot id in the meantime; the next follow-up cancels
  // whichever bot the request holds by then.
  if (!isClaimed) {
    return { status: 'failed', reason: 'request changed during the lookup' };
  }

  return cancelLeftoverRecallBot({ client, callRecordingId, externalBotId });
};
