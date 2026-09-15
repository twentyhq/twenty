import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
import {
  findCallRecordingForArtifactsImport,
  type CallRecordingForArtifactsImport,
} from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';

type CallRecordingArtifactImportExecutionResult<TResult> =
  | {
      status: 'executed';
      result: TResult;
    }
  | {
      status: 'skipped';
      reason:
        | 'artifact import already in progress'
        | 'no matching call recording';
    };

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
  const hasClaimedArtifactImport = await claimCallRecordingArtifactsImport(
    client,
    {
      callRecordingId,
      scope,
      now,
    },
  );

  if (!hasClaimedArtifactImport) {
    return {
      status: 'skipped',
      reason: 'artifact import already in progress',
    };
  }

  try {
    const callRecording = await findCallRecordingForArtifactsImport(
      client,
      callRecordingId,
    );

    if (isUndefined(callRecording)) {
      return {
        status: 'skipped',
        reason: 'no matching call recording',
      };
    }

    return {
      status: 'executed',
      result: await runImport(callRecording),
    };
  } finally {
    await releaseCallRecordingArtifactsImportClaim(client, {
      callRecordingId,
      scope,
    });
  }
};
