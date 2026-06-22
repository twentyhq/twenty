import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotMetadata } from 'src/logic-functions/domain/build-recall-bot-metadata.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { scheduleRecallBot } from 'src/logic-functions/recall-api/schedule-recall-bot.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

// The sole place a Recall bot is created. Only the deterministic-create winner and the stale-state cron call it, so one writer per meeting POSTs exactly one bot.
export const ensureMeetingBot = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<boolean> => {
  const meetingUrl = calendarEvent.conferenceLinkUrl;
  const meetingStartsAt = calendarEvent.startsAt;

  if (isUndefined(meetingUrl) || isUndefined(meetingStartsAt)) {
    return false;
  }

  const joinAt = computeRecallBotJoinAt(meetingStartsAt);

  const freshCallRecording = (
    await findCallRecordingsByIds(client, [callRecording.id])
  )[0];

  if (
    isUndefined(freshCallRecording) ||
    freshCallRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.REQUESTED ||
    !isUndefined(freshCallRecording.externalBotId)
  ) {
    return false;
  }

  const scheduleResult = await scheduleRecallBot({
    meetingUrl,
    joinAt,
    metadata: buildRecallBotMetadata({ callRecording, calendarEvent }),
  });

  if (!scheduleResult.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to schedule Recall bot for callRecording ${callRecording.id}: ${scheduleResult.errorMessage}`,
    );

    return false;
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: { externalBotId: scheduleResult.externalBotId },
  });

  return true;
};
