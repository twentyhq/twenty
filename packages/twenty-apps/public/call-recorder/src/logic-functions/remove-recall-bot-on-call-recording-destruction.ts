import { defineLogicFunction } from 'twenty-sdk/define';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DESTRUCTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-destruction-logic-function-universal-identifier';
import { buildRemoveRecallBotOnCallRecordingRemovalHandler } from 'src/logic-functions/flows/build-remove-recall-bot-on-call-recording-removal-handler.util';

export const removeRecallBotOnCallRecordingDestructionHandler =
  buildRemoveRecallBotOnCallRecordingRemovalHandler({
    expectedAction: 'destroyed',
  });

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DESTRUCTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-destruction',
  description:
    'Cancels the Recall bot of a destroyed call recording before its markers disappear with the row.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingDestructionHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.destroyed',
  },
});
