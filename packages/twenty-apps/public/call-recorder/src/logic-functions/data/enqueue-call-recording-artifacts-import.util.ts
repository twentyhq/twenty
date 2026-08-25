import { enqueueJobs } from 'twenty-sdk/logic-function';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';

export const enqueueCallRecordingArtifactsImport = async ({
  callRecordingId,
}: {
  callRecordingId: string;
}): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: [{ callRecordingId, requestedAt: new Date().toISOString() }],
    retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
  });
};
