import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';

import { RESUME_RESTORED_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/resume-restored-call-recording-logic-function-universal-identifier';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { clearCallRecordingBotStateAfterRemoval } from 'src/logic-functions/data/clear-call-recording-bot-state-after-removal.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { resetRestoredCallRecordingBotState } from 'src/logic-functions/data/reset-restored-call-recording-bot-state.util';
import { getCallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';
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
  botScheduleAttemptId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
};

type CallRecordingRestorationEvent =
  ObjectRecordRestoreEvent<CallRecordingForRestorationEvent>;

export const resumeRestoredCallRecordingHandler = async (
  event: CallRecordingRestorationEvent,
): Promise<{
  removedExternalBotIds: string[];
  result: ResumePendingCallRecordingResult;
}> => {
  const client = new CoreApiClient();
  const restoredCallRecordingBeforeRemoval = (
    await findCallRecordingsByFilter(client, {
      id: { eq: event.recordId },
      deletedAt: { is: 'NULL' },
    })
  )[0];

  if (isUndefined(restoredCallRecordingBeforeRemoval)) {
    throw new Error('Restored CallRecording is not visible yet');
  }

  const statusBeforeRemoval =
    restoredCallRecordingBeforeRemoval.status ?? undefined;

  if (!isRecallBotRemovalCallRecordingStatus(statusBeforeRemoval)) {
    return {
      removedExternalBotIds: [],
      result: {
        status: 'skipped',
        reason: 'call recording does not have a removable bot state',
      },
    };
  }

  const externalBotIdBeforeRemoval =
    restoredCallRecordingBeforeRemoval.externalBotId ?? undefined;
  const botScheduleAttemptBeforeRemoval =
    restoredCallRecordingBeforeRemoval.botScheduleAttempt;
  const hadBotSchedulingStateBeforeRemoval =
    !isUndefined(externalBotIdBeforeRemoval) ||
    !isUndefined(botScheduleAttemptBeforeRemoval);
  const restorationEventCallRecording = event.properties.after;
  const restorationEventExternalBotId =
    restorationEventCallRecording.externalBotId ?? undefined;
  const restorationEventBotScheduleAttempt =
    getCallRecordingBotScheduleAttempt(restorationEventCallRecording);
  const doesCurrentBotStateMatchRestorationEvent =
    externalBotIdBeforeRemoval === restorationEventExternalBotId &&
    botScheduleAttemptBeforeRemoval?.id ===
      restorationEventBotScheduleAttempt?.id &&
    botScheduleAttemptBeforeRemoval?.attemptedAt ===
      restorationEventBotScheduleAttempt?.attemptedAt &&
    botScheduleAttemptBeforeRemoval?.idempotencyKey ===
      restorationEventBotScheduleAttempt?.idempotencyKey;

  if (
    hadBotSchedulingStateBeforeRemoval &&
    !doesCurrentBotStateMatchRestorationEvent
  ) {
    return {
      removedExternalBotIds: [],
      result: {
        status: 'deferred',
        reason: 'call recording bot ownership changed after restoration',
      },
    };
  }

  const removedExternalBotIds = await removeRecallBotsForCallRecording({
    callRecordingId: event.recordId,
    status: statusBeforeRemoval,
    externalBotId: externalBotIdBeforeRemoval,
    botScheduleAttempt: botScheduleAttemptBeforeRemoval,
  });

  if (
    hadBotSchedulingStateBeforeRemoval &&
    isUndefined(externalBotIdBeforeRemoval) &&
    removedExternalBotIds.length === 0
  ) {
    throw new Error('Attempted Recall bot is not visible yet');
  }

  let restoredCallRecordingAfterRemoval =
    restoredCallRecordingBeforeRemoval;
  const didRemoveExternalBot = removedExternalBotIds.length > 0;
  const didClearStoredExternalBotId =
    didRemoveExternalBot && !isUndefined(externalBotIdBeforeRemoval);

  if (didRemoveExternalBot) {
    const didClearRemovedBotState =
      await clearCallRecordingBotStateAfterRemoval(client, {
        callRecordingId: event.recordId,
        externalBotId: externalBotIdBeforeRemoval,
        botScheduleAttempt: botScheduleAttemptBeforeRemoval,
      });

    if (!didClearRemovedBotState) {
      return {
        removedExternalBotIds,
        result: {
          status: 'deferred',
          reason:
            'call recording bot ownership changed while its old bot was removed',
        },
      };
    }

    const refreshedRestoredCallRecording = (
      await findCallRecordingsByFilter(client, {
        id: { eq: event.recordId },
        deletedAt: { is: 'NULL' },
      })
    )[0];

    if (isUndefined(refreshedRestoredCallRecording)) {
      throw new Error('Restored CallRecording is not visible after bot removal');
    }

    restoredCallRecordingAfterRemoval = refreshedRestoredCallRecording;
  }

  const statusAfterRemoval =
    restoredCallRecordingAfterRemoval.status ?? undefined;

  if (!isRecallBotRemovalCallRecordingStatus(statusAfterRemoval)) {
    return {
      removedExternalBotIds,
      result: {
        status: 'skipped',
        reason: 'call recording does not have a removable bot state',
      },
    };
  }

  const externalBotIdAfterRemoval =
    restoredCallRecordingAfterRemoval.externalBotId ?? undefined;
  const botScheduleAttemptAfterRemoval =
    restoredCallRecordingAfterRemoval.botScheduleAttempt;
  const hasBotSchedulingStateAfterRemoval =
    !isUndefined(externalBotIdAfterRemoval) ||
    !isUndefined(botScheduleAttemptAfterRemoval);

  const shouldResetRestoredCallRecordingState =
    hasBotSchedulingStateAfterRemoval ||
    (restoredCallRecordingAfterRemoval.recordingRequestStatus ===
      CallRecordingRequestStatus.REQUESTED &&
      statusAfterRemoval !== CallRecordingStatus.SCHEDULED &&
      statusAfterRemoval !== CallRecordingStatus.FAILED);

  if (
    shouldResetRestoredCallRecordingState &&
    !(await resetRestoredCallRecordingBotState(client, {
      callRecordingId: event.recordId,
      status: statusAfterRemoval,
      recordingRequestStatus:
        restoredCallRecordingAfterRemoval.recordingRequestStatus ?? undefined,
      externalBotId: externalBotIdAfterRemoval,
      botScheduleAttempt: botScheduleAttemptAfterRemoval,
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

  if (statusAfterRemoval === CallRecordingStatus.FAILED) {
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
    restoredCallRecordingAfterRemoval.recordingRequestStatus ===
      CallRecordingRequestStatus.REQUESTED &&
    (didClearStoredExternalBotId ||
      (shouldResetRestoredCallRecordingState &&
        (statusAfterRemoval !== CallRecordingStatus.SCHEDULED ||
          !isUndefined(externalBotIdAfterRemoval))))
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
