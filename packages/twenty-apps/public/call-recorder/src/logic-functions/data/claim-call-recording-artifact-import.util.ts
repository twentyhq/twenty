import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_ARTIFACT_IMPORT_CLAIM_TTL_MS } from 'src/logic-functions/constants/call-recording-artifact-import-claim-ttl-ms';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';

const CLAIM_FIELD_BY_SCOPE = {
  transcript: 'transcriptImportClaimedAt',
  media: 'artifactsImportClaimedAt',
} as const;

// Atomic per-recording, per-scope lease. The conditional update matches only when
// no fresh lease is held, so exactly one of several concurrent webhook retries
// claims that scope and performs its provider-facing work. Without it two passes
// could both observe "no artifact yet" and both pay the provider for it.
export const claimCallRecordingArtifactImport = async (
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
    now.getTime() - CALL_RECORDING_ARTIFACT_IMPORT_CLAIM_TTL_MS,
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

export const releaseCallRecordingArtifactImportClaim = async (
  client: CoreApiClient,
  {
    callRecordingId,
    scope,
  }: {
    callRecordingId: string;
    scope: CallRecordingArtifactImportScope;
  },
): Promise<void> => {
  await updateCallRecording(client, {
    id: callRecordingId,
    data: { [CLAIM_FIELD_BY_SCOPE[scope]]: null },
  });
};
