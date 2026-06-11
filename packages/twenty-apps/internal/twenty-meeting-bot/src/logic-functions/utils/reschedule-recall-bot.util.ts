import { CoreApiClient } from 'twenty-client-sdk/core';

import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotMetadata } from 'src/logic-functions/utils/build-recall-bot-metadata.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { rescheduleRecallRecordingBot } from 'src/logic-functions/utils/reschedule-recall-recording-bot.util';
import { updateCallRecording } from 'src/logic-functions/utils/update-call-recording.util';

const RECALL_BOT_NOT_FOUND_STATUS = 404;

export const rescheduleRecallBot = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<void> => {
  const externalBotId = callRecording.externalBotId ?? null;

  if (!isNonEmptyString(externalBotId)) {
    return;
  }

  const meetingUrl = calendarEvent.conferenceLink?.primaryLinkUrl ?? null;
  const joinAt = calendarEvent.startsAt;

  if (meetingUrl === null || joinAt === null) {
    return;
  }

  const rescheduleResult = await rescheduleRecallRecordingBot({
    externalBotId,
    meetingUrl,
    joinAt,
    metadata: buildRecallBotMetadata({ callRecording, calendarEvent }),
  });

  if (rescheduleResult.ok) {
    return;
  }

  // The bot vanished externally; drop the id so the convergence cron re-creates it as the single writer.
  if (rescheduleResult.status === RECALL_BOT_NOT_FOUND_STATUS) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: { externalBotId: null },
    });

    return;
  }

  console.warn(
    `[recall-recording-bot] failed to update Recall bot for callRecording ${callRecording.id}: ${rescheduleResult.errorMessage}`,
  );
};
