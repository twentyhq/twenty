import { isUndefined } from '@sniptt/guards';

import {
  IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { FIRST_CALL_RECORDING_ARTIFACT_IMPORT_ATTEMPT } from 'src/logic-functions/constants/first-call-recording-artifact-import-attempt';
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
  requestedAt,
  attempt,
  delayMs,
}: {
  callRecordingId: string;
  scope: CallRecordingArtifactImportScope;
  // A re-enqueue keeps the original delivery timestamp so a pending transcript
  // marker still records when the transcript was first asked for.
  requestedAt?: string;
  attempt?: number;
  delayMs?: number;
}): Promise<void> => {
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER_BY_SCOPE[scope],
    payloads: [
      {
        callRecordingId,
        requestedAt: requestedAt ?? new Date().toISOString(),
        attempt: attempt ?? FIRST_CALL_RECORDING_ARTIFACT_IMPORT_ATTEMPT,
      },
    ],
    ...(isUndefined(delayMs) ? {} : { delayMs }),
  });
};
