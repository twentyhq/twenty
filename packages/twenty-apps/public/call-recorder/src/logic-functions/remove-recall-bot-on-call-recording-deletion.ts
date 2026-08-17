import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-deletion-logic-function-universal-identifier';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { getCallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';
import { isRecallBotRemovalCallRecordingStatus } from 'src/logic-functions/domain/is-recall-bot-removal-call-recording-status.util';
import { removeRecallBotsForCallRecording } from 'src/logic-functions/flows/remove-recall-bots-for-call-recording.util';

type CallRecordingForRemovalEvent = {
  id: string;
  status?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
};

type CallRecordingDeletionEvent = DatabaseEventPayload<
  ObjectRecordDeleteEvent<CallRecordingForRemovalEvent>
>;

export const removeRecallBotOnCallRecordingDeletionHandler = async (
  event: CallRecordingDeletionEvent,
): Promise<{ removedExternalBotIds: string[] }> => {
  const isStillDeleted =
    (
      await findCallRecordingsByFilter(new CoreApiClient(), {
        id: { eq: event.recordId },
        deletedAt: { is: 'NOT_NULL' },
      })
    ).length > 0;

  // A queued retry can outlive a quick restore. Do not let the stale deletion
  // event remove the replacement bot that the restored row now owns.
  if (!isStillDeleted) {
    return { removedExternalBotIds: [] };
  }

  const callRecording = event.properties.before;
  const externalBotId = callRecording.externalBotId ?? undefined;
  const botScheduleAttempt =
    getCallRecordingBotScheduleAttempt(callRecording);
  const removedExternalBotIds = await removeRecallBotsForCallRecording({
    callRecordingId: event.recordId,
    status: callRecording.status ?? undefined,
    externalBotId,
    botScheduleAttempt,
  });

  if (
    isRecallBotRemovalCallRecordingStatus(
      callRecording.status ?? undefined,
    ) &&
    externalBotId === undefined &&
    botScheduleAttempt !== undefined &&
    removedExternalBotIds.length === 0
  ) {
    throw new Error('Attempted Recall bot is not visible yet');
  }

  return { removedExternalBotIds };
};

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-deletion',
  description:
    'Best-effort removal of a Recall bot when its CallRecording is deleted.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingDeletionHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.deleted',
  },
});
