import {
  IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';

const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER_BY_SCOPE: Record<
  CallRecordingArtifactImportScope,
  string
> = {
  transcript: IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  media: IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
};

export const enqueueCallRecordingArtifactImport = async ({
  callRecordingId,
  scope,
}: {
  callRecordingId: string;
  scope: CallRecordingArtifactImportScope;
}): Promise<void> => {
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER_BY_SCOPE[scope],
    payloads: [
      { callRecordingId, requestedAt: new Date().toISOString() },
    ],
  });
};
