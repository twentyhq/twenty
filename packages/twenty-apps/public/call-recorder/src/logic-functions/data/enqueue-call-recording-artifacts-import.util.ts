import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';

export const enqueueCallRecordingArtifactsImport = async ({
  callRecordingId,
  scopes,
}: {
  callRecordingId: string;
  scopes: CallRecordingArtifactImportScope[];
}): Promise<void> => {
  const requestedAt = new Date().toISOString();

  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: scopes.map((scope) => ({
      callRecordingId,
      requestedAt,
      scope,
    })),
  });
};
