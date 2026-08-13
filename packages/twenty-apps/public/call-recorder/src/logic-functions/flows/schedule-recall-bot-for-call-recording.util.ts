import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { buildRecallBotAutomaticVideoOutput } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output.util';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { attachRecallBotToCallRecording } from 'src/logic-functions/data/attach-recall-bot-to-call-recording.util';
import { claimCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/claim-call-recording-bot-schedule-attempt.util';
import { removeRecallBotOrThrow } from 'src/logic-functions/recall-api/remove-recall-bot-or-throw.util';
import {
  computeRecallBotCreationIdempotencyKey,
  scheduleRecallBot,
} from 'src/logic-functions/recall-api/schedule-recall-bot.util';

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
  const routingMetadata = buildRecallRoutingMetadata({
    callRecordingId: callRecording.id,
    workspaceId,
  });
  const botScheduleAttemptedAt = resolveBotScheduleAttemptedAt({
    callRecording: freshCallRecording,
    meetingUrl,
    joinAt,
    routingMetadata,
  });
  const botScheduleIdempotencyKey = computeRecallBotCreationIdempotencyKey({
    meetingUrl,
    joinAt,
    metadata: routingMetadata,
    botScheduleAttemptedAt,
  });
  const didClaimScheduleAttempt = await claimCallRecordingBotScheduleAttempt(
    client,
    {
      callRecordingId: callRecording.id,
      expectedBotScheduleAttemptedAt: freshCallRecording.botScheduleAttemptedAt,
      expectedBotScheduleIdempotencyKey:
        freshCallRecording.botScheduleIdempotencyKey,
      botScheduleAttemptedAt,
      botScheduleIdempotencyKey,
    },
  );

  if (!didClaimScheduleAttempt) {
    return false;
  }

  const metadata = {
    ...routingMetadata,
    twentyBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
  };

  const scheduleResult = await scheduleRecallBot({
    meetingUrl,
    meetingStartsAt,
    joinAt,
    metadata,
    automaticVideoOutput,
    idempotencyKey: botScheduleIdempotencyKey,
  });

  if (!scheduleResult.ok) {
    console.warn(
      `[call-recorder] failed to schedule Recall bot for callRecording ${callRecording.id}: ${scheduleResult.errorMessage}`,
    );

    return false;
  }

  return attachRecallBotOrRemoveAfterOwnershipLoss({
    client,
    callRecordingId: callRecording.id,
    externalBotId: scheduleResult.externalBotId,
    botScheduleIdempotencyKey,
  });
};

const resolveBotScheduleAttemptedAt = ({
  callRecording,
  meetingUrl,
  joinAt,
  routingMetadata,
}: {
  callRecording: CallRecordingRecord;
  meetingUrl: string;
  joinAt: string;
  routingMetadata: ReturnType<typeof buildRecallRoutingMetadata>;
}): string => {
  const recordedAttemptTimestamp = callRecording.botScheduleAttemptedAt;
  const recordedIdempotencyKey = callRecording.botScheduleIdempotencyKey;

  if (
    !isUndefined(recordedAttemptTimestamp) &&
    !isUndefined(recordedIdempotencyKey) &&
    recordedIdempotencyKey ===
      computeRecallBotCreationIdempotencyKey({
        meetingUrl,
        joinAt,
        metadata: routingMetadata,
        botScheduleAttemptedAt: recordedAttemptTimestamp,
      })
  ) {
    return recordedAttemptTimestamp;
  }

  return new Date().toISOString();
};

const attachRecallBotOrRemoveAfterOwnershipLoss = async ({
  client,
  callRecordingId,
  externalBotId,
  botScheduleIdempotencyKey,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string;
  botScheduleIdempotencyKey: string;
}): Promise<boolean> => {
  let didAttachRecallBot = false;

  try {
    didAttachRecallBot = await attachRecallBotToCallRecording(client, {
      callRecordingId,
      externalBotId,
      botScheduleIdempotencyKey,
    });
  } catch (writeBackError) {
    try {
      const callRecordingAfterWriteBackFailure = (
        await findCallRecordingsByIds(client, [callRecordingId])
      )[0];

      if (
        callRecordingAfterWriteBackFailure?.externalBotId === externalBotId &&
        callRecordingAfterWriteBackFailure.botScheduleIdempotencyKey ===
          botScheduleIdempotencyKey
      ) {
        return true;
      }

      if (
        callRecordingAfterWriteBackFailure?.recordingRequestStatus ===
          CallRecordingRequestStatus.REQUESTED &&
        callRecordingAfterWriteBackFailure.status ===
          CallRecordingStatus.SCHEDULED &&
        isUndefined(callRecordingAfterWriteBackFailure.externalBotId) &&
        callRecordingAfterWriteBackFailure.botScheduleIdempotencyKey ===
          botScheduleIdempotencyKey
      ) {
        throw writeBackError;
      }
    } catch {
      throw writeBackError;
    }
  }

  if (didAttachRecallBot) {
    return true;
  }

  const callRecordingAfterOwnershipLoss = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (
    callRecordingAfterOwnershipLoss?.externalBotId === externalBotId &&
    callRecordingAfterOwnershipLoss.botScheduleIdempotencyKey ===
      botScheduleIdempotencyKey
  ) {
    return true;
  }

  await removeRecallBotOrThrow(externalBotId);

  return false;
};
