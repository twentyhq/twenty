import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/summarize-call-recording-logic-function-universal-identifier';
import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';
const TRANSCRIPT_FIELD_NAME = 'transcript';

type CallRecordingForDatabaseEvent = {
  id: string;
};

type CallRecordingDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CallRecordingForDatabaseEvent>
>;

export const summarizeCallRecordingHandler = async (
  event: CallRecordingDatabaseEvent,
): Promise<object> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALL_RECORDING_OBJECT_NAME || action !== 'updated') {
    return { skipped: true, reason: 'not a call recording update' };
  }

  const updatedFields = event.properties.updatedFields ?? [];

  if (!updatedFields.includes(TRANSCRIPT_FIELD_NAME)) {
    return { skipped: true, reason: 'transcript unchanged' };
  }

  const client = new CoreApiClient();
  const result = await generateCallRecordingSummary(client, {
    callRecordingId: event.recordId,
    requireCreatedByCallRecorder: true,
  });

  return { callRecordingId: event.recordId, ...result };
};

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
