import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';

// Crash safety net: a lease older than this is reclaimable so a worker that died
// mid-import never blocks the recording forever. Normal runs release explicitly.
const ARTIFACTS_IMPORT_CLAIM_TTL_MS = 10 * 60 * 1000;

const CLAIM_FIELD_BY_SCOPE = {
  transcript: 'transcriptImportClaimedAt',
  media: 'artifactsImportClaimedAt',
} as const;

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
): Promise<boolean> => {
  const claimField = CLAIM_FIELD_BY_SCOPE[scope];
  const staleBefore = new Date(
    now.getTime() - ARTIFACTS_IMPORT_CLAIM_TTL_MS,
  ).toISOString();

  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          or: [
            { [claimField]: { is: 'NULL' } },
            { [claimField]: { lte: staleBefore } },
          ],
        },
        data: { [claimField]: now.toISOString() },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};

export const releaseCallRecordingArtifactsImportClaim = async (
  client: CoreApiClient,
  {
    callRecordingId,
    scope,
  }: {
    callRecordingId: string;
    scope: CallRecordingArtifactImportScope;
  },
): Promise<void> => {
  await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        data: { [CLAIM_FIELD_BY_SCOPE[scope]]: null },
      },
      id: true,
    },
  });
};
