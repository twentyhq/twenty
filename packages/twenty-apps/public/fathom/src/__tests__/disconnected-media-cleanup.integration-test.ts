import { isNonEmptyString } from '@sniptt/guards';
import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { functionExecute } from 'twenty-sdk/cli';
import { describe, expect, it } from 'vitest';

describe('Fathom disconnected media cleanup', () => {
  it.each([
    { description: 'null media', video: null, audio: null },
    { description: 'empty media arrays', video: [], audio: [] },
  ])(
    'settles an empty transcript with $description',
    async ({ video, audio }) => {
      const coreApiClient = new CoreApiClient();
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
              fathomConnectedAccountId: connectedAccountId,
              fathomMediaDownloadId: randomUUID(),
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
          updatedCallRecordingCount: 1,
          shouldContinue: false,
        });

        const current = await coreApiClient.query({
          callRecording: {
            __args: { filter: { id: { eq: callRecordingId } } },
            status: true,
            fathomMediaFailureReason: true,
            fathomMediaDownloadId: true,
            fathomMediaImportClaimedAt: true,
          },
        });

        expect(current.callRecording).toMatchObject({
          status: 'FAILED',
          fathomMediaFailureReason: 'connected_account_unavailable',
          fathomMediaImportClaimedAt: null,
        });
        expect(
          isNonEmptyString(current.callRecording?.fathomMediaDownloadId),
        ).toBe(false);
      } finally {
        await coreApiClient.mutation({
          destroyCallRecording: { __args: { id: callRecordingId }, id: true },
        });
      }
    },
  );
});
