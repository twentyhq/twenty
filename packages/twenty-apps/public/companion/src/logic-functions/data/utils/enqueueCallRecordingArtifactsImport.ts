import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/utils/enqueueLogicFunctionJobs';

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
