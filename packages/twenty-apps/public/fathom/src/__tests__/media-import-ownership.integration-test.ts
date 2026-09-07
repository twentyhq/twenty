import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { claimFathomMediaImport } from 'src/logic-functions/utils/claim-fathom-media-import.util';
import { updateFathomRecordingImport } from 'src/logic-functions/utils/update-fathom-recording-import.util';

const createFathomApplicationCoreApiClient =
  async (): Promise<CoreApiClient> => {
    const metadataApiClient = new MetadataApiClient();
    const applicationsResult = await metadataApiClient.query({
      findManyApplications: {
        id: true,
        universalIdentifier: true,
      },
    });
    const fathomApplication = applicationsResult.findManyApplications.find(
      (application) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    if (!fathomApplication) {
      throw new Error('Expected the Fathom application to be installed');
    }

    const applicationTokenResult = await metadataApiClient.mutation({
      generateApplicationToken: {
        __args: { applicationId: fathomApplication.id },
        applicationAccessToken: { token: true },
      },
    });

    return new CoreApiClient({
      headers: {
        Authorization: `Bearer ${applicationTokenResult.generateApplicationToken.applicationAccessToken.token}`,
      },
    });
  };

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

      const current = await coreApiClient.query({
        fathomRecordingImport: {
          __args: { filter: { id: { eq: fathomRecordingImportId } } },
          mediaFailureReason: true,
        },
      });

      expect(current.fathomRecordingImport?.mediaFailureReason).toBe(
        'download_expired',
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
