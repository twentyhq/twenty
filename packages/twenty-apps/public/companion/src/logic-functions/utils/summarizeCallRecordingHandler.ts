import { CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueJobs } from 'twenty-sdk/logic-function';
import {
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER';
import { generateCallRecordingSummary } from 'src/logic-functions/flows/utils/generateCallRecordingSummary';
import { buildStepError } from 'src/logic-functions/utils/buildStepError';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';

const TRANSCRIPT_FIELD_NAME = 'transcript';

type CallRecordingForDatabaseEvent = {
  id: string;
};

type CallRecordingDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CallRecordingForDatabaseEvent>
>;

export const summarizeCallRecordingHandler = async (
  event: CallRecordingDatabaseEvent | { callRecordingId: string },
): Promise<object> => {
  if ('callRecordingId' in event) {
    try {
      const result = await generateCallRecordingSummary(new CoreApiClient(), {
        callRecordingId: event.callRecordingId,
      });
      return { callRecordingId: event.callRecordingId, ...result };
    } catch (error) {
      throw buildStepError('call recording summarization', error);
    }
  }
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALL_RECORDING_OBJECT_NAME || action !== 'updated') {
    return { skipped: true, reason: 'not a call recording update' };
  }

  const updatedFields = event.properties.updatedFields ?? [];

  if (!updatedFields.includes(TRANSCRIPT_FIELD_NAME)) {
    return { skipped: true, reason: 'transcript unchanged' };
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      SUMMARIZE_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        jobId: `companion-summary-${event.recordId}`,
        payload: { callRecordingId: event.recordId },
      },
    ],
  });
  return { callRecordingId: event.recordId, enqueued: true };
};
