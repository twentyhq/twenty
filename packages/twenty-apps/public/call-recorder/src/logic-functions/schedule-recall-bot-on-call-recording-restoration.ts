import { defineLogicFunction } from 'twenty-sdk/define';

import { SCHEDULE_RECALL_BOT_ON_CALL_RECORDING_RESTORATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/schedule-recall-bot-on-call-recording-restoration-logic-function-universal-identifier';
import { scheduleRecallBotOnCallRecordingRestorationHandler } from 'src/logic-functions/schedule-recall-bot-on-call-recording-restoration-handler';

export default defineLogicFunction({
  universalIdentifier:
    SCHEDULE_RECALL_BOT_ON_CALL_RECORDING_RESTORATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'schedule-recall-bot-on-call-recording-restoration',
  description:
    'Resumes Recall bot scheduling when a CallRecording is restored.',
  timeoutSeconds: 60,
  handler: scheduleRecallBotOnCallRecordingRestorationHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.restored',
  },
});
