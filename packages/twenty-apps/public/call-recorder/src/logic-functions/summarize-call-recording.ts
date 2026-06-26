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

// Runs out-of-band from the Recall webhook so the (possibly slow) agent call
// never blocks webhook acknowledgement. Both the webhook and the cron fill the
// transcript via updateCallRecording, which emits this callRecording.updated
// event; summary-only writes don't touch the transcript field, so there is no
// re-entrancy.
export const summarizeCallRecordingHandler = async (
  event: CallRecordingDatabaseEvent,
): Promise<object | undefined> => {
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
  });

  return { callRecordingId: event.recordId, ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'summarize-call-recording',
  description:
    'Generates an AI recap of a recording transcript and stores it on the Call Recording summary field when the transcript is filled.',
  timeoutSeconds: 250,
  handler: summarizeCallRecordingHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALL_RECORDING_OBJECT_NAME}.updated`,
  },
});
