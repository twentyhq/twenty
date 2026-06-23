import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotMetadata } from 'src/logic-functions/domain/build-recall-bot-metadata.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { fetchCurrentWorkspaceId } from 'src/logic-functions/data/fetch-current-workspace-id.util';
import { rescheduleRecallBot } from 'src/logic-functions/recall-api/reschedule-recall-bot.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

const RECALL_BOT_NOT_FOUND_STATUS = 404;

export const rescheduleCallRecordingBot = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<void> => {
  const externalBotId = callRecording.externalBotId;

  if (isUndefined(externalBotId)) {
    return;
  }

  const meetingUrl = calendarEvent.conferenceLinkUrl;
  const meetingStartsAt = calendarEvent.startsAt;

  if (isUndefined(meetingUrl) || isUndefined(meetingStartsAt)) {
    return;
  }

  const joinAt = computeRecallBotJoinAt(meetingStartsAt);

  const workspaceId = await fetchCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    console.warn(
      `[twenty-meeting-bot] cannot reschedule Recall bot for callRecording ${callRecording.id}: workspace id unavailable`,
    );

    return;
  }

  const rescheduleResult = await rescheduleRecallBot({
    externalBotId,
    meetingUrl,
    joinAt,
    metadata: buildRecallBotMetadata({
      callRecording,
      calendarEvent,
      workspaceId,
    }),
  });

  if (rescheduleResult.ok) {
    return;
  }

  // The bot vanished externally; drop the id so the stale-state cron re-creates it as the single writer.
  if (rescheduleResult.status === RECALL_BOT_NOT_FOUND_STATUS) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: { externalBotId: null },
    });

    return;
  }

  console.warn(
    `[twenty-meeting-bot] failed to update Recall bot for callRecording ${callRecording.id}: ${rescheduleResult.errorMessage}`,
  );
};
