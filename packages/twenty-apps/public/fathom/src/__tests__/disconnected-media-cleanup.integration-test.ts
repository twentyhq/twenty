import { isNonEmptyString } from '@sniptt/guards';
import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { functionExecute } from 'twenty-sdk/cli';
import { describe, expect, it } from 'vitest';

import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';

describe('Fathom disconnected media cleanup', () => {
  it.each([
    { description: 'null media', video: null, audio: null },
    { description: 'empty media arrays', video: [], audio: [] },
  ])(
    'settles an empty transcript with $description',
    async ({ video, audio }) => {
      const coreApiClient = new CoreApiClient();
      const applicationCoreApiClient =
        await createFathomApplicationCoreApiClient();
      const callRecordingId = randomUUID();
      const connectedAccountId = randomUUID();

      await coreApiClient.mutation({
        createCallRecording: {
          __args: {
            data: {
              id: callRecordingId,
              title: 'Fathom disconnected cleanup integration fixture',
              status: 'PROCESSING',
              transcript: [],
              video,
              audio,
            },
          },
          id: true,
        },
      });

      await applicationCoreApiClient.mutation({
        createFathomRecordingImport: {
          __args: {
            data: {
              id: callRecordingId,
              callRecordingId,
              recordingId: randomUUID(),
              connectedAccountId,
              mediaDownloadId: randomUUID(),
            },
          },
          id: true,
        },
      });

      try {
        const result = await functionExecute({
          appPath: process.cwd(),
          functionName: 'fathom-reconcile-media-imports',
          payload: { disconnectedAccountId: connectedAccountId },
        });

        if (!result.success) {
          throw new Error(result.error.message);
        }

        expect(result.data.status).toBe('SUCCESS');
        expect(result.data.data).toEqual({
          candidateCount: 1,
          updatedRecordingCount: 1,
          shouldContinue: false,
          skipped: false,
        });

        const current = await coreApiClient.query({
          callRecording: {
            __args: { filter: { id: { eq: callRecordingId } } },
            status: true,
          },
          fathomRecordingImport: {
            __args: { filter: { id: { eq: callRecordingId } } },
            mediaFailureReason: true,
            mediaDownloadId: true,
            mediaImportClaimedAt: true,
          },
        });

        expect(current.callRecording?.status).toBe('FAILED');
        expect(current.fathomRecordingImport).toMatchObject({
          mediaFailureReason: 'connected_account_unavailable',
          mediaImportClaimedAt: null,
        });
        expect(
          isNonEmptyString(current.fathomRecordingImport?.mediaDownloadId),
        ).toBe(false);
      } finally {
        await coreApiClient.mutation({
          destroyCallRecording: { __args: { id: callRecordingId }, id: true },
        });
      }
    },
  );
});
