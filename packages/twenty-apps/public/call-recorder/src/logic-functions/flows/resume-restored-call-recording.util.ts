import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { findScheduledRecallBotIdsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-ids-by-call-recording-id.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { isTerminalRecallBotSnapshot } from 'src/logic-functions/domain/is-terminal-recall-bot-snapshot.util';
import {
  resumePendingCallRecording,
  type ResumePendingCallRecordingResult,
} from 'src/logic-functions/flows/resume-pending-call-recording.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export type ResumeRestoredCallRecordingResult =
  | { status: 'skipped'; reason: string }
  | { status: 'keptExistingBot'; externalBotId: string }
  | { status: 'adoptedExistingBot'; externalBotId: string }
  | { status: 'rescheduled'; result: ResumePendingCallRecordingResult };

// A pending delayed cancellation may still kill the recorded bot, so it is
// verified at Recall before being trusted: alive keeps it, gone starts fresh.
export const resumeRestoredCallRecording = async ({
  client,
  callRecordingId,
  retry,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  retry: { retryCount: number; maxRetries: number };
}): Promise<ResumeRestoredCallRecordingResult> => {
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (isUndefined(callRecording)) {
    if (retry.retryCount < retry.maxRetries) {
      throw buildRetryableStepFailure(
        `restored callRecording ${callRecordingId} visibility`,
        'restored row is not readable yet',
      );
    }

    return { status: 'skipped', reason: 'restored call recording not visible' };
  }

  if (
    callRecording.recordingRequestStatus !==
    CallRecordingRequestStatus.REQUESTED
  ) {
    return { status: 'skipped', reason: 'recording request is not active' };
  }

  if (callRecording.status !== CallRecordingStatus.SCHEDULED) {
    return {
      status: 'skipped',
      reason: 'only scheduled recordings are resumable',
    };
  }

  if (!isUndefined(callRecording.externalBotId)) {
    return resolveRecordedBot({
      client,
      callRecordingId,
      externalBotId: callRecording.externalBotId,
      retry,
    });
  }

  if (!isUndefined(callRecording.botScheduleAttemptedAt)) {
    return resolveAmbiguousAttempt({ client, callRecordingId, retry });
  }

  return reschedule({ client, callRecordingId });
};

const resolveRecordedBot = async ({
  client,
  callRecordingId,
  externalBotId,
  retry,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string;
  retry: { retryCount: number; maxRetries: number };
}): Promise<ResumeRestoredCallRecordingResult> => {
  const botResult = await getRecallBot({ externalBotId });

  if (botResult.ok && !isTerminalRecallBotSnapshot(botResult.bot)) {
    return { status: 'keptExistingBot', externalBotId };
  }

  const isBotGone =
    (botResult.ok && isTerminalRecallBotSnapshot(botResult.bot)) ||
    (!botResult.ok && botResult.status === 404);

  if (!isBotGone) {
    if (retry.retryCount < retry.maxRetries) {
      throw buildRetryableStepFailure(
        `Recall bot verification for restored callRecording ${callRecordingId}`,
        'transient Recall failure',
      );
    }

    return {
      status: 'skipped',
      reason: 'Recall unreachable; the daily reconciliation owns this row',
    };
  }

  await clearBotState({ client, callRecordingId });

  return reschedule({ client, callRecordingId });
};

const resolveAmbiguousAttempt = async ({
  client,
  callRecordingId,
  retry,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  retry: { retryCount: number; maxRetries: number };
}): Promise<ResumeRestoredCallRecordingResult> => {
  const lookupResult = await findScheduledRecallBotIdsByCallRecordingId();

  if (!lookupResult.ok) {
    if (retry.retryCount < retry.maxRetries) {
      throw buildRetryableStepFailure(
        `Recall bot lookup for restored callRecording ${callRecordingId}`,
        'transient Recall failure',
      );
    }

    return {
      status: 'skipped',
      reason: 'Recall unreachable; the daily reconciliation owns this row',
    };
  }

  const externalBotId =
    lookupResult.externalBotIdByCallRecordingId.get(callRecordingId);

  if (!isUndefined(externalBotId)) {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: { externalBotId },
    });

    return { status: 'adoptedExistingBot', externalBotId };
  }

  await clearBotState({ client, callRecordingId });

  return reschedule({ client, callRecordingId });
};

const clearBotState = async ({
  client,
  callRecordingId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
}): Promise<void> => {
  await updateCallRecording(client, {
    id: callRecordingId,
    data: {
      externalBotId: null,
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    },
  });
};

const reschedule = async ({
  client,
  callRecordingId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
}): Promise<ResumeRestoredCallRecordingResult> => {
  const result = await resumePendingCallRecording({
    client,
    callRecordingId,
    now: new Date(),
  });

  return { status: 'rescheduled', result };
};
