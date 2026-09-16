import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/types/call-recording-for-artifacts-import.type';

type CallRecordingArtifactImportExecutionResult<TResult> =
  | {
      status: 'executed';
      result: TResult;
    }
  | { status: 'skipped' };

export const runCallRecordingArtifactImportWithClaim = async <TResult>({
  client,
  callRecordingId,
  scope,
  now,
  runImport,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  scope: CallRecordingArtifactImportScope;
  now: Date;
  runImport: (
    callRecording: CallRecordingForArtifactsImport,
  ) => Promise<TResult>;
}): Promise<CallRecordingArtifactImportExecutionResult<TResult>> => {
  const claimedCallRecording = await claimCallRecordingArtifactsImport(client, {
    callRecordingId,
    scope,
    now,
  });

  if (isUndefined(claimedCallRecording)) {
    return { status: 'skipped' };
  }

  try {
    return {
      status: 'executed',
      result: await runImport(claimedCallRecording),
    };
  } finally {
    await releaseCallRecordingArtifactsImportClaim(client, {
      callRecordingId,
      scope,
      claimedAt: now.toISOString(),
    });
  }
};
