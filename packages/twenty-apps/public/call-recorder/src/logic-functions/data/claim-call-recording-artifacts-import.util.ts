import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

// Crash safety net: a lease older than this is reclaimable so a worker that died
// mid-import never blocks the recording forever. Normal runs release explicitly.
const ARTIFACTS_IMPORT_CLAIM_TTL_MS = 10 * 60 * 1000;

// Atomic per-recording lease. The conditional update matches only when no fresh
// lease is held, so exactly one of several concurrent webhook retries claims the
// import and performs the provider-facing work.
export const claimCallRecordingArtifactsImport = async (
  client: CoreApiClient,
  {
    callRecordingId,
    now,
  }: {
    callRecordingId: string;
    now: Date;
  },
): Promise<boolean> => {
  const staleBefore = new Date(
    now.getTime() - ARTIFACTS_IMPORT_CLAIM_TTL_MS,
  ).toISOString();

  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          or: [
            { artifactsImportClaimedAt: { is: 'NULL' } },
            { artifactsImportClaimedAt: { lte: staleBefore } },
          ],
        },
        data: { artifactsImportClaimedAt: now.toISOString() },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};

export const releaseCallRecordingArtifactsImportClaim = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<void> => {
  await updateCallRecording(client, {
    id: callRecordingId,
    data: { artifactsImportClaimedAt: null },
  });
};
