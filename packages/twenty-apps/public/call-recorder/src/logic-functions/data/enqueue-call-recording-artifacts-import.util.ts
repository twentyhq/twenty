import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-logic-function-universal-identifier';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';

export const enqueueCallRecordingArtifactsImport = async ({
  callRecordingId,
}: {
  callRecordingId: string;
}): Promise<void> => {
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: [{ callRecordingId, requestedAt: new Date().toISOString() }],
  });
};
