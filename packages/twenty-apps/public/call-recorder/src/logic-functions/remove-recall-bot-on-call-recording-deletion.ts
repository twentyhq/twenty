import { defineLogicFunction } from 'twenty-sdk/define';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-deletion-logic-function-universal-identifier';
import { buildRemoveRecallBotOnCallRecordingRemovalHandler } from 'src/logic-functions/flows/build-remove-recall-bot-on-call-recording-removal-handler.util';

export const removeRecallBotOnCallRecordingDeletionHandler =
  buildRemoveRecallBotOnCallRecordingRemovalHandler({
    expectedAction: 'deleted',
  });

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DELETION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-deletion',
  description:
    'Cancels the Recall bot of a deleted call recording instead of waiting for the daily orphan sweep.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingDeletionHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.deleted',
  },
});
