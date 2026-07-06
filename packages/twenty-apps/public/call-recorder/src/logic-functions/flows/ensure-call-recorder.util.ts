import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotAutomaticVideoOutput } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output.util';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { scheduleRecallBot } from 'src/logic-functions/recall-api/schedule-recall-bot.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

const logInfo = (message: string) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info(message);
  }
};

// The sole place a Recall bot is created. Only the deterministic-create winner and the stale-state cron call it, so one writer per meeting POSTs exactly one bot.
export const ensureCallRecorder = async (
  client: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<boolean> => {
  const meetingUrl = calendarEvent.conferenceLinkUrl;
  const meetingStartsAt = calendarEvent.startsAt;

  if (isUndefined(meetingUrl) || isUndefined(meetingStartsAt)) {
    logInfo(
      `[call-recorder] skipping Recall bot scheduling for callRecording ${callRecording.id}: missing ${
        isUndefined(meetingUrl) ? 'meeting URL' : 'meeting start time'
      }`,
    );

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
    logInfo(
      `[call-recorder] skipping Recall bot scheduling for callRecording ${callRecording.id}: recording is missing, no longer requested, or already has a bot`,
    );

    return false;
  }

  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    console.error(
      `[call-recorder] cannot schedule Recall bot for callRecording ${callRecording.id}: workspace id unavailable, the shared webhook could not be routed back`,
    );

    return false;
  }

  const automaticVideoOutput = await buildRecallBotAutomaticVideoOutput();

  logInfo(
    `[call-recorder] scheduling Recall bot for callRecording ${callRecording.id} at ${joinAt}`,
  );

  const scheduleResult = await scheduleRecallBot({
    meetingUrl,
    joinAt,
    metadata: buildRecallRoutingMetadata({
      callRecordingId: callRecording.id,
      workspaceId,
    }),
    automaticVideoOutput,
  });

  if (!scheduleResult.ok) {
    console.warn(
      `[call-recorder] failed to schedule Recall bot for callRecording ${callRecording.id}: ${scheduleResult.errorMessage}`,
    );

    return false;
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: { externalBotId: scheduleResult.externalBotId },
  });

  logInfo(
    `[call-recorder] scheduled Recall bot ${scheduleResult.externalBotId} for callRecording ${callRecording.id}`,
  );

  return true;
};
