import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotMetadata } from 'src/logic-functions/utils/build-recall-bot-metadata.util';
import { findCallRecordingsByIds } from 'src/logic-functions/utils/find-call-recordings-by-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { scheduleRecallRecordingBot } from 'src/logic-functions/utils/schedule-recall-recording-bot.util';
import { updateCallRecording } from 'src/logic-functions/utils/update-call-recording.util';

// The sole place a Recall bot is created. Only the deterministic-create winner and the convergence cron call it, so one writer per meeting POSTs exactly one bot.
export const ensureRecallBot = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<void> => {
  const meetingUrl = calendarEvent.conferenceLink?.primaryLinkUrl ?? null;
  const joinAt = calendarEvent.startsAt;

  if (meetingUrl === null || joinAt === null) {
    return;
  }

  const freshCallRecording = (
    await findCallRecordingsByIds(client, [callRecording.id])
  )[0];

  if (
    freshCallRecording === undefined ||
    freshCallRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.REQUESTED ||
    isNonEmptyString(freshCallRecording.externalBotId)
  ) {
    return;
  }

  const scheduleResult = await scheduleRecallRecordingBot({
    meetingUrl,
    joinAt,
    metadata: buildRecallBotMetadata({ callRecording, calendarEvent }),
  });

  if (!scheduleResult.ok) {
    console.warn(
      `[recall-recording-bot] failed to schedule Recall bot for callRecording ${callRecording.id}: ${scheduleResult.errorMessage}`,
    );

    return;
  }

  if (scheduleResult.externalBotId !== null) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: { externalBotId: scheduleResult.externalBotId },
    });
  }
};
