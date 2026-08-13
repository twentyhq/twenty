import { defineLogicFunction } from 'twenty-sdk/define';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-deletion-logic-function-universal-identifier';
import { removeRecallBotOnCallRecordingRemovalHandler } from 'src/logic-functions/remove-recall-bot-on-call-recording-removal-handler';

const CALL_RECORDING_DELETED_EVENT_NAME = 'callRecording.deleted';

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-deletion',
  description: 'Removes the Recall bot when its CallRecording is soft-deleted.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingRemovalHandler,
  databaseEventTriggerSettings: {
    eventName: CALL_RECORDING_DELETED_EVENT_NAME,
  },
});
