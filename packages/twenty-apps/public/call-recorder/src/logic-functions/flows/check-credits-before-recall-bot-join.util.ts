import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCreditsUnavailableFailureReason } from 'src/logic-functions/data/get-credits-unavailable-failure-reason.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';

export type CheckCreditsBeforeRecallBotJoinResult =
  | { status: 'skipped'; reason: string }
  | { status: 'allowed' }
  | { status: 'blocked'; failureReason: string };

export const checkCreditsBeforeRecallBotJoin = async ({
  client,
  callRecordingId,
  joinAt,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  joinAt: string;
  now: Date;
}): Promise<CheckCreditsBeforeRecallBotJoinResult> => {
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (
    isUndefined(callRecording) ||
    callRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.REQUESTED ||
    callRecording.status !== CallRecordingStatus.SCHEDULED ||
    isUndefined(callRecording.externalBotId) ||
    isUndefined(callRecording.calendarEventId)
  ) {
    return {
      status: 'skipped',
      reason: 'call recording no longer awaits a scheduled bot',
    };
  }

  const meetingStartsAt = (
    await fetchCalendarEventsByIds(client, [callRecording.calendarEventId])
  )[0]?.startsAt;

  if (
    isUndefined(meetingStartsAt) ||
    computeRecallBotJoinAt(meetingStartsAt) !== joinAt
  ) {
    return {
      status: 'skipped',
      reason: 'meeting moved after this check was enqueued',
    };
  }

  // A late job must never cut a call that is already being recorded.
  if (now.getTime() >= new Date(joinAt).getTime()) {
    return { status: 'skipped', reason: 'bot join time has passed' };
  }

  const failureReason = await getCreditsUnavailableFailureReason();

  if (isUndefined(failureReason)) {
    return { status: 'allowed' };
  }

  if (!(await cancelOrEjectRecallBot(callRecording.externalBotId))) {
    throw new Error(
      `Recall bot ${callRecording.externalBotId} could not be canceled`,
    );
  }

  await updateNonTerminalCallRecordingState(client, {
    callRecordingId,
    data: {
      status: CallRecordingStatus.NOT_RECORDED,
      callRecorderFailureReason: failureReason,
    },
  });
  await updateCallRecording(client, {
    id: callRecordingId,
    data: {
      externalBotId: null,
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    },
  });

  console.warn(
    `[call-recorder] callRecording ${callRecordingId} will not be recorded: ${failureReason}`,
  );

  return { status: 'blocked', failureReason };
};
