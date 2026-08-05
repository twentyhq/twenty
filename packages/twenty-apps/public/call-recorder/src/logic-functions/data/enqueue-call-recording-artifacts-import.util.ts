import { enqueueJob } from 'twenty-sdk/logic-function';

import { IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-job-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';

// Throwing on enqueue failure keeps the webhook response non-2xx so Svix redelivers it.
export const enqueueCallRecordingArtifactsImport = async (
  request: CallRecordingArtifactsImportRequest,
): Promise<void> => {
  try {
    await enqueueJob({
      logicFunctionUniversalIdentifier:
        IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { ...request },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  } catch (error) {
    throw Object.assign(
      new Error(
        `failed to enqueue artifact import for call recording ${request.callRecordingId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
      { cause: error },
    );
  }
};
