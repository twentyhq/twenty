import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotAutomaticVideoOutput } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output.util';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import {
  computeRecallBotCreationIdempotencyKey,
  scheduleRecallBot,
} from 'src/logic-functions/recall-api/schedule-recall-bot.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

// The sole place a Recall bot is created. Only the deterministic-create winner and the stale-state cron call it, so one writer per meeting POSTs exactly one bot.
export const scheduleRecallBotForCallRecording = async (
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
    freshCallRecording.status !== CallRecordingStatus.SCHEDULED ||
    !isUndefined(freshCallRecording.externalBotId)
  ) {
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
  const metadata = buildRecallRoutingMetadata({
    callRecordingId: callRecording.id,
    workspaceId,
  });
  const idempotencyKey = computeRecallBotCreationIdempotencyKey({
    meetingUrl,
    joinAt,
    metadata,
  });

  // Persisted before the POST so a crash leaves proof that a bot creation may
  // have reached Recall; while the stored key still matches the scheduling
  // inputs, recovery can re-send the creation idempotently instead of asking
  // Recall whether a bot already exists. Re-sends of the same key keep the
  // first attempt's timestamp so repeated unknown outcomes age out of the
  // resend window instead of staying trusted forever.
  const recordedAttemptTimestamp =
    freshCallRecording.botScheduleIdempotencyKey === idempotencyKey
      ? freshCallRecording.botScheduleAttemptedAt
      : undefined;

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      botScheduleAttemptedAt:
        recordedAttemptTimestamp ?? new Date().toISOString(),
      botScheduleIdempotencyKey: idempotencyKey,
    },
  });

  const scheduleResult = await scheduleRecallBot({
    meetingUrl,
    joinAt,
    metadata,
    automaticVideoOutput,
    idempotencyKey,
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

  return true;
};
