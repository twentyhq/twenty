import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-deletion-logic-function-universal-identifier';
import {
  removeRecallBotsForRemovedCallRecording,
  type RemovedCallRecordingRecallFields,
} from 'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util';

const CALL_RECORDING_DELETED_EVENT_NAME = 'callRecording.deleted';

type CallRecordingDeletedEvent = DatabaseEventPayload<
  ObjectRecordDeleteEvent<RemovedCallRecordingRecallFields>
>;

export const removeRecallBotOnCallRecordingDeletionHandler = async (
  event: CallRecordingDeletedEvent,
) => {
  if (event.name !== CALL_RECORDING_DELETED_EVENT_NAME) {
    return { skipped: true, reason: 'not a call recording deletion' };
  }

  return removeRecallBotsForRemovedCallRecording({
    callRecordingId: event.recordId,
    externalBotId: event.properties.before.externalBotId,
    botScheduleAttemptedAt: event.properties.before.botScheduleAttemptedAt,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-deletion',
  description: 'Removes the Recall bot when its CallRecording is soft-deleted.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingDeletionHandler,
  databaseEventTriggerSettings: {
    eventName: CALL_RECORDING_DELETED_EVENT_NAME,
  },
});
