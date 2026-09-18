import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_BOT_ALREADY_JOINED_STATUS } from 'src/logic-functions/constants/recall-bot-already-joined-status';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCreditsUnavailableFailureReason } from 'src/logic-functions/data/get-credits-unavailable-failure-reason.util';
import { markCallRecordingNotRecorded } from 'src/logic-functions/data/mark-call-recording-not-recorded.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';

export type CheckCreditsBeforeRecallBotJoinResult =
  | { status: 'skipped'; reason: string }
  | { status: 'allowed' }
  | { status: 'blocked'; failureReason: string };

export const checkCreditsBeforeRecallBotJoin = async ({
  client,
  callRecordingId,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
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

  if (isUndefined(meetingStartsAt)) {
    return { status: 'skipped', reason: 'meeting has no start time' };
  }

  // A late job must never cut a call that is already being recorded.
  if (
    now.getTime() >= new Date(computeRecallBotJoinAt(meetingStartsAt)).getTime()
  ) {
    return { status: 'skipped', reason: 'bot join time has passed' };
  }

  const failureReason = await getCreditsUnavailableFailureReason();

  if (isUndefined(failureReason)) {
    return { status: 'allowed' };
  }

  // Delete only, never eject: Recall refuses the delete once the bot has joined, so a late job cannot cut a call.
  const cancelResult = await cancelRecallBot({
    externalBotId: callRecording.externalBotId,
  });

  if (
    !cancelResult.ok &&
    cancelResult.status === RECALL_BOT_ALREADY_JOINED_STATUS
  ) {
    return { status: 'skipped', reason: 'bot has already joined' };
  }

  if (!cancelResult.ok) {
    throw new Error(
      `Recall bot ${callRecording.externalBotId} could not be canceled: ${cancelResult.errorMessage}`,
    );
  }

  await markCallRecordingNotRecorded({
    client,
    callRecordingId,
    failureReason,
  });
  await updateCallRecording(client, {
    id: callRecordingId,
    data: {
      externalBotId: null,
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    },
  });

  return { status: 'blocked', failureReason };
};
