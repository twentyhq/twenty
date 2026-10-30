import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_BOT_ALREADY_JOINED_STATUS } from 'src/logic-functions/constants/recall-bot-already-joined-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { clearCanceledRecallBot } from 'src/logic-functions/data/clear-canceled-recall-bot.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCreditsUnavailableFailureReason } from 'src/logic-functions/data/get-credits-unavailable-failure-reason.util';
import { isAppPreferencesEnabled } from 'src/logic-functions/data/is-app-preferences-enabled.util';
import { markCallRecordingNotRecorded } from 'src/logic-functions/data/mark-call-recording-not-recorded.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';

export type CheckCreditsBeforeRecallBotJoinResult =
  | { status: 'skipped'; reason: string }
  | { status: 'allowed' }
  | { status: 'blocked'; failureReason: string }
  | { status: 'canceled' };

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

  // Backstop for a deferred deletion whose follow-up did not get the bot deleted.
  if (
    callRecording?.recordingRequestStatus ===
      CallRecordingRequestStatus.CANCELED &&
    !isUndefined(callRecording.externalBotId) &&
    (await isAppPreferencesEnabled())
  ) {
    return cancelCanceledRequestRecallBot({
      client,
      callRecording,
      externalBotId: callRecording.externalBotId,
      now,
    });
  }

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
    console.warn(
      `[call-recorder] pre-join credit check for callRecording ${callRecordingId} ran after the bot join time; the recording proceeds unchecked`,
    );

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

  const didMarkNotRecorded = await markCallRecordingNotRecorded(client, {
    callRecordingId,
    failureReason,
  });

  if (!didMarkNotRecorded) {
    return {
      status: 'skipped',
      reason:
        'call recording reached a terminal status while its bot was being canceled',
    };
  }

  return { status: 'blocked', failureReason };
};

const cancelCanceledRequestRecallBot = async ({
  client,
  callRecording,
  externalBotId,
  now,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  externalBotId: string;
  now: Date;
}): Promise<CheckCreditsBeforeRecallBotJoinResult> => {
  const meetingStartsAt = isUndefined(callRecording.calendarEventId)
    ? undefined
    : (
        await fetchCalendarEventsByIds(client, [callRecording.calendarEventId])
      )[0]?.startsAt;

  if (isUndefined(meetingStartsAt)) {
    return { status: 'skipped', reason: 'meeting has no start time' };
  }

  if (
    now.getTime() >= new Date(computeRecallBotJoinAt(meetingStartsAt)).getTime()
  ) {
    return { status: 'skipped', reason: 'bot join time has passed' };
  }

  // Delete only, like the credit block: the follow-up ejects a bot that already joined.
  const cancelResult = await cancelRecallBot({ externalBotId });

  if (
    !cancelResult.ok &&
    cancelResult.status === RECALL_BOT_ALREADY_JOINED_STATUS
  ) {
    return { status: 'skipped', reason: 'bot has already joined' };
  }

  if (!cancelResult.ok) {
    throw new Error(
      `Recall bot ${externalBotId} of canceled call recording ${callRecording.id} could not be canceled: ${cancelResult.errorMessage}`,
    );
  }

  await clearCanceledRecallBot(client, {
    callRecordingId: callRecording.id,
    externalBotId,
  });

  return { status: 'canceled' };
};
