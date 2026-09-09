import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';
import { claimFathomMediaImport } from 'src/logic-functions/utils/claim-fathom-media-import.util';
import { updateFathomRecordingImport } from 'src/logic-functions/utils/update-fathom-recording-import.util';
import { updateFathomMediaDownloadId } from 'src/logic-functions/utils/update-fathom-media-download-id.util';

describe('Fathom recording import ownership', () => {
  it.each([
    {
      changedField: 'owner',
      fields: { connectedAccountId: randomUUID() },
    },
    {
      changedField: 'download',
      fields: { mediaDownloadId: randomUUID() },
    },
    {
      changedField: 'claim',
      fields: { mediaImportClaimedAt: null },
    },
  ])('rejects a worker after its $changedField changes', async ({ fields }) => {
    const coreApiClient = await createFathomApplicationCoreApiClient();
    const fathomRecordingImportId = randomUUID();
    const connectedAccountId = randomUUID();
    const downloadId = randomUUID();

    await coreApiClient.mutation({
      createFathomRecordingImport: {
        __args: {
          data: {
            id: fathomRecordingImportId,
            recordingId: randomUUID(),
            connectedAccountId,
            mediaDownloadId: downloadId,
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
            fathomRecordingImportId,
            now: claimTime,
          }),
        ),
      );
      const successfulClaims = claims.filter((claim) => claim !== undefined);

      expect(successfulClaims).toHaveLength(1);

      const claim = successfulClaims[0];

      if (!claim) {
        throw new Error('Expected one worker to claim the recording import');
      }

      const writeContext = {
        fathomRecordingImportId,
        connectedAccountId,
        downloadId,
        claimedAt: claim.claimedAt,
      };

      expect(
        await updateFathomRecordingImport({
          coreApiClient,
          writeContext,
          fields: { mediaFailureReason: 'download_expired' },
        }),
      ).toBe(true);

      await coreApiClient.mutation({
        updateFathomRecordingImport: {
          __args: { id: fathomRecordingImportId, data: fields },
          id: true,
        },
      });

      expect(
        await updateFathomRecordingImport({
          coreApiClient,
          writeContext,
          fields: { mediaFailureReason: null },
        }),
      ).toBe(false);

      const replacementDownloadId = randomUUID();

      expect(
        await updateFathomMediaDownloadId({
          coreApiClient,
          writeContext,
          downloadId: replacementDownloadId,
        }),
      ).toBe(false);

      const current = await coreApiClient.query({
        fathomRecordingImport: {
          __args: { filter: { id: { eq: fathomRecordingImportId } } },
          mediaFailureReason: true,
          mediaDownloadId: true,
        },
      });

      expect(current.fathomRecordingImport?.mediaFailureReason).toBe(
        'download_expired',
      );
      expect(current.fathomRecordingImport?.mediaDownloadId).not.toBe(
        replacementDownloadId,
      );
    } finally {
      await coreApiClient.mutation({
        destroyFathomRecordingImport: {
          __args: { id: fathomRecordingImportId },
          id: true,
        },
      });
    }
  });
});
