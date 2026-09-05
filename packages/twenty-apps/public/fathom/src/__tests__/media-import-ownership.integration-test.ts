import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { claimFathomMediaImport } from 'src/logic-functions/utils/claim-fathom-media-import.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

describe('Fathom media import ownership', () => {
  it.each([
    {
      changedField: 'owner',
      fields: { fathomConnectedAccountId: randomUUID() },
    },
    {
      changedField: 'download',
      fields: { fathomMediaDownloadId: randomUUID() },
    },
    {
      changedField: 'claim',
      fields: { fathomMediaImportClaimedAt: null },
    },
  ])('rejects a worker after its $changedField changes', async ({ fields }) => {
    const coreApiClient = new CoreApiClient();
    const callRecordingId = randomUUID();
    const connectedAccountId = randomUUID();
    const downloadId = randomUUID();

    await coreApiClient.mutation({
      createCallRecording: {
        __args: {
          data: {
            id: callRecordingId,
            title: 'Fathom ownership integration fixture',
            status: 'PROCESSING',
            fathomConnectedAccountId: connectedAccountId,
            fathomMediaDownloadId: downloadId,
          },
        },
        id: true,
      },
    });

    try {
      const now = new Date();
      const claims = await Promise.all(
        [now, new Date(now.getTime() + 1)].map((claimTime) =>
          claimFathomMediaImport({
            coreApiClient,
            callRecordingId,
            now: claimTime,
          }),
        ),
      );
      const successfulClaims = claims.filter((claim) => claim !== undefined);

      expect(successfulClaims).toHaveLength(1);

      const claim = successfulClaims[0];

      if (!claim) {
        throw new Error('Expected one worker to claim the recording');
      }

      const writeContext = {
        connectedAccountId,
        downloadId,
        claimedAt: claim.claimedAt,
      };

      expect(
        await updateCallRecordingMedia({
          coreApiClient,
          callRecordingId,
          writeContext,
          fields: { fathomMediaFailureReason: 'download_expired' },
        }),
      ).toBe(true);

      await coreApiClient.mutation({
        updateCallRecording: {
          __args: { id: callRecordingId, data: fields },
          id: true,
        },
      });

      expect(
        await updateCallRecordingMedia({
          coreApiClient,
          callRecordingId,
          writeContext,
          fields: { fathomMediaFailureReason: null },
        }),
      ).toBe(false);

      const current = await coreApiClient.query({
        callRecording: {
          __args: { filter: { id: { eq: callRecordingId } } },
          fathomMediaFailureReason: true,
        },
      });

      expect(current.callRecording?.fathomMediaFailureReason).toBe(
        'download_expired',
      );
    } finally {
      await coreApiClient.mutation({
        destroyCallRecording: { __args: { id: callRecordingId }, id: true },
      });
    }
  });
});
