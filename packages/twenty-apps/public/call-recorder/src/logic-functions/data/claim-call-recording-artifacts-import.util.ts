import { type CoreApiClient } from 'twenty-client-sdk/core';

import { ARTIFACTS_IMPORT_CLAIM_FIELD_BY_SCOPE } from 'src/logic-functions/constants/artifacts-import-claim-field-by-scope';
import { CALL_RECORDING_FOR_ARTIFACTS_IMPORT_SELECTION } from 'src/logic-functions/constants/call-recording-for-artifacts-import-selection';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { parseCallRecordingForArtifactsImportNode } from 'src/logic-functions/data/parse-call-recording-for-artifacts-import-node.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/types/call-recording-for-artifacts-import.type';

// The executor Lambda runs with this hard timeout regardless of the function's
// timeoutSeconds, which only bounds how long the server waits for the invoke.
const LOGIC_FUNCTION_LAMBDA_HARD_TIMEOUT_MS = 15 * 60 * 1000;

// Crash safety net: a lease older than this is reclaimable so a worker that died
// mid-import never blocks the recording forever. It must outlive the Lambda so
// a second job never uploads on top of one that is still running.
const ARTIFACTS_IMPORT_CLAIM_TTL_MS =
  LOGIC_FUNCTION_LAMBDA_HARD_TIMEOUT_MS + 60 * 1000;

export const claimCallRecordingArtifactsImport = async (
  client: CoreApiClient,
  {
    callRecordingId,
    scope,
    now,
  }: {
    callRecordingId: string;
    scope: CallRecordingArtifactImportScope;
    now: Date;
  },
): Promise<CallRecordingForArtifactsImport | undefined> => {
  const claimField = ARTIFACTS_IMPORT_CLAIM_FIELD_BY_SCOPE[scope];
  const staleBefore = new Date(
    now.getTime() - ARTIFACTS_IMPORT_CLAIM_TTL_MS,
  ).toISOString();

  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { eq: CallRecordingStatus.PROCESSING },
          or: [
            { [claimField]: { is: 'NULL' } },
            { [claimField]: { lte: staleBefore } },
          ],
        },
        data: { [claimField]: now.toISOString() },
      },
      ...CALL_RECORDING_FOR_ARTIFACTS_IMPORT_SELECTION,
    },
  });

  return parseCallRecordingForArtifactsImportNode(
    result.updateCallRecordings?.[0],
  );
};

export const releaseCallRecordingArtifactsImportClaim = async (
  client: CoreApiClient,
  {
    callRecordingId,
    scope,
    claimedAt,
  }: {
    callRecordingId: string;
    scope: CallRecordingArtifactImportScope;
    claimedAt: string;
  },
): Promise<void> => {
  await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          [ARTIFACTS_IMPORT_CLAIM_FIELD_BY_SCOPE[scope]]: { eq: claimedAt },
        },
        data: { [ARTIFACTS_IMPORT_CLAIM_FIELD_BY_SCOPE[scope]]: null },
      },
      id: true,
    },
  });
};
