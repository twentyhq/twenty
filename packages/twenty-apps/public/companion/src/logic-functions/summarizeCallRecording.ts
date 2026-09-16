import { defineLogicFunction } from 'twenty-sdk/define';
import { SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER';
import { summarizeCallRecordingHandler } from 'src/logic-functions/utils/summarizeCallRecordingHandler';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';

export default defineLogicFunction({
  universalIdentifier:
    SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'summarize-call-recording',
  description:
    'Generates an AI recap of a recording transcript and stores it on the Call Recording summary field when the transcript is filled.',
  timeoutSeconds: 60 * 4,
  handler: summarizeCallRecordingHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALL_RECORDING_OBJECT_NAME}.updated`,
  },
});
