import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';

import { RESUME_RESTORED_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/resume-restored-call-recording-logic-function-universal-identifier';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { resetRestoredCallRecordingBotState } from 'src/logic-functions/data/reset-restored-call-recording-bot-state.util';
import { isRecallBotRemovalCallRecordingStatus } from 'src/logic-functions/domain/is-recall-bot-removal-call-recording-status.util';
import { removeRecallBotsForCallRecording } from 'src/logic-functions/flows/remove-recall-bots-for-call-recording.util';
import {
  resumePendingCallRecording,
  type ResumePendingCallRecordingResult,
} from 'src/logic-functions/flows/resume-pending-call-recording.util';

type CallRecordingForRestorationEvent = {
  id: string;
  status?: string | null;
  recordingRequestStatus?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
};

type CallRecordingRestorationEvent = DatabaseEventPayload<
  ObjectRecordRestoreEvent<CallRecordingForRestorationEvent>
>;

export const resumeRestoredCallRecordingHandler = async (
  event: CallRecordingRestorationEvent,
): Promise<{
  removedExternalBotIds: string[];
  result: ResumePendingCallRecordingResult;
}> => {
  const callRecording = event.properties.after;
  const status = callRecording.status ?? undefined;

  if (!isRecallBotRemovalCallRecordingStatus(status)) {
    return {
      removedExternalBotIds: [],
      result: {
        status: 'skipped',
        reason: 'call recording does not have a removable bot state',
      },
    };
  }

  const externalBotId = callRecording.externalBotId ?? undefined;
  const botScheduleAttemptedAt =
    callRecording.botScheduleAttemptedAt ?? undefined;
  const botScheduleIdempotencyKey =
    callRecording.botScheduleIdempotencyKey ?? undefined;
  const hasBotSchedulingState =
    !isUndefined(externalBotId) ||
    !isUndefined(botScheduleAttemptedAt) ||
    !isUndefined(botScheduleIdempotencyKey);
  const client = new CoreApiClient();
  const removedExternalBotIds = await removeRecallBotsForCallRecording({
    callRecordingId: event.recordId,
    status,
    externalBotId,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  });

  if (
    hasBotSchedulingState &&
    !(await resetRestoredCallRecordingBotState(client, {
      id: event.recordId,
      status,
      recordingRequestStatus:
        callRecording.recordingRequestStatus ?? undefined,
      externalBotId,
      botScheduleAttemptedAt,
      botScheduleIdempotencyKey,
    }))
  ) {
    return {
      removedExternalBotIds,
      result: {
        status: 'deferred',
        reason: 'call recording changed while its old bot was removed',
      },
    };
  }

  if (status === CallRecordingStatus.FAILED) {
    return {
      removedExternalBotIds,
      result: {
        status: 'skipped',
        reason: 'restored failed call recording remains failed',
      },
    };
  }

  // Clearing an owned bot or resetting an in-progress status emits an update
  // handled by schedule-recall-bot-on-call-recording-update. Let that existing
  // trigger be the single scheduler. A SCHEDULED id-less row only changed its
  // attempt markers, which are deliberately excluded from that trigger, so it
  // resumes inline below.
  if (
    hasBotSchedulingState &&
    callRecording.recordingRequestStatus ===
      CallRecordingRequestStatus.REQUESTED &&
    (status !== CallRecordingStatus.SCHEDULED ||
      !isUndefined(externalBotId))
  ) {
    return {
      removedExternalBotIds,
      result: {
        status: 'deferred',
        reason: 'bot state reset; the update trigger will resume scheduling',
      },
    };
  }

  return {
    removedExternalBotIds,
    result: await resumePendingCallRecording({
      client,
      callRecordingId: event.recordId,
      now: new Date(),
    }),
  };
};

export default defineLogicFunction({
  universalIdentifier:
    RESUME_RESTORED_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'resume-restored-call-recording',
  description:
    'Removes stale Recall bot ownership and resumes a restored CallRecording.',
  timeoutSeconds: 60,
  handler: resumeRestoredCallRecordingHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.restored',
  },
});
