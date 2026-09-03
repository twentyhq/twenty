import { isUndefined } from '@sniptt/guards';

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
  transcript:
    IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  media: IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
};

export const enqueueCallRecordingArtifactsImport = async ({
  callRecordingId,
  scope,
  requestedAt,
  leaseRetryCount,
  delayMs,
}: {
  callRecordingId: string;
  scope: CallRecordingArtifactImportScope;
  requestedAt?: string;
  leaseRetryCount?: number;
  delayMs?: number;
}): Promise<void> => {
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER_BY_SCOPE[scope],
    payloads: [
      {
        callRecordingId,
        requestedAt: requestedAt ?? new Date().toISOString(),
        ...(isUndefined(leaseRetryCount) ? {} : { leaseRetryCount }),
      },
    ],
    ...(isUndefined(delayMs) ? {} : { delayMs }),
  });
};
