import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
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
