import { randomUUID } from 'crypto';

import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotAutomaticVideoOutput } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output.util';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { isCompleteCallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { recordCallRecordingBotScheduleAttemptIfActive } from 'src/logic-functions/data/record-call-recording-bot-schedule-attempt-if-active.util';
import { recordCallRecordingExternalBotIdForScheduleAttempt } from 'src/logic-functions/data/record-call-recording-external-bot-id-for-schedule-attempt.util';
import {
  computeRecallBotCreationIdempotencyKey,
  scheduleRecallBot,
} from 'src/logic-functions/recall-api/schedule-recall-bot.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';

// The sole place a Recall bot is created. A conditional attempt claim elects
// one writer; retries reuse that attempt's identity and idempotency key.
export const scheduleRecallBotForCallRecording = async (
  coreApiClient: CoreApiClient,
  { callRecording, calendarEvent }: MeetingRecording,
): Promise<boolean> => {
  const meetingUrl = calendarEvent.conferenceLinkUrl;
  const meetingStartsAt = calendarEvent.startsAt;

  if (isUndefined(meetingUrl) || isUndefined(meetingStartsAt)) {
    return false;
  }

  const joinAt = computeRecallBotJoinAt(meetingStartsAt);

  const freshCallRecording = (
    await findCallRecordingsByIds(coreApiClient, [callRecording.id])
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
  const existingAttempt = freshCallRecording.botScheduleAttempt;

  if (
    !isUndefined(existingAttempt) &&
    !isCompleteCallRecordingBotScheduleAttempt(existingAttempt)
  ) {
    return false;
  }

  const botScheduleAttemptId = existingAttempt?.id ?? randomUUID();
  const metadata = buildRecallRoutingMetadata({
    callRecordingId: callRecording.id,
    workspaceId,
    botScheduleAttemptId,
  });
  const idempotencyKey = computeRecallBotCreationIdempotencyKey({
    meetingUrl,
    joinAt,
    metadata,
  });

  if (
    !isUndefined(existingAttempt) &&
    existingAttempt.idempotencyKey !== idempotencyKey
  ) {
    return false;
  }

  // Persist the attempt identity before the POST. Re-sends preserve the first
  // timestamp, while a replacement lifecycle claims a new UUID.
  const nextAttempt = {
    id: botScheduleAttemptId,
    attemptedAt: existingAttempt?.attemptedAt ?? new Date().toISOString(),
    idempotencyKey,
  };

  const didRecordScheduleAttempt =
    await recordCallRecordingBotScheduleAttemptIfActive(coreApiClient, {
      callRecordingId: callRecording.id,
      expectedAttempt: existingAttempt,
      nextAttempt,
    });

  if (!didRecordScheduleAttempt) {
    return false;
  }

  const scheduleResult = await scheduleRecallBot({
    meetingUrl,
    meetingStartsAt,
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

  const didRecordExternalBotId =
    await recordCallRecordingExternalBotIdForScheduleAttempt(coreApiClient, {
      callRecordingId: callRecording.id,
      botScheduleAttemptId,
      externalBotId: scheduleResult.externalBotId,
    });

  if (!didRecordExternalBotId) {
    const callRecordingAfterWritebackConflict = (
      await findCallRecordingsByIds(coreApiClient, [callRecording.id])
    )[0];

    if (
      callRecordingAfterWritebackConflict?.botScheduleAttempt?.id ===
        botScheduleAttemptId &&
      callRecordingAfterWritebackConflict.externalBotId ===
        scheduleResult.externalBotId
    ) {
      return true;
    }

    await cancelOrEjectRecallBot(scheduleResult.externalBotId);

    return false;
  }

  return true;
};
