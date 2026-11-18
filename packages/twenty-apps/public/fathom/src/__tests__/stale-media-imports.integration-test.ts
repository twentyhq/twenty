import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';
import { findStaleFathomMediaImports } from 'src/logic-functions/utils/find-stale-fathom-media-imports.util';

describe('Fathom stale media import lookup', () => {
  it.each([
    {
      description: 'no account is connected',
      buildActiveConnectedAccountIds: () => [],
      isExpectedToMatch: true,
    },
    {
      description: 'only another account is connected',
      buildActiveConnectedAccountIds: () => [randomUUID()],
      isExpectedToMatch: true,
    },
    {
      description: 'its account is still connected',
      buildActiveConnectedAccountIds: (connectedAccountId: string) => [
        connectedAccountId,
      ],
      isExpectedToMatch: false,
    },
  ])(
    'selects an import outside the healing window only when disconnected: $description',
    async ({ buildActiveConnectedAccountIds, isExpectedToMatch }) => {
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
              title: 'Fathom stale media lookup integration fixture',
              status: 'PROCESSING',
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
            },
          },
          id: true,
        },
      });

      try {
        const now = Date.now();
        const page = await findStaleFathomMediaImports({
          coreApiClient: applicationCoreApiClient,
          run: {
            startedAfter: new Date(now).toISOString(),
            staleBefore: new Date(now + 60_000).toISOString(),
          },
          activeConnectedAccountIds:
            buildActiveConnectedAccountIds(connectedAccountId),
        });

        expect(
          page.callRecordings.map(({ id }) => id).includes(callRecordingId),
        ).toBe(isExpectedToMatch);
      } finally {
        await coreApiClient.mutation({
          destroyCallRecording: { __args: { id: callRecordingId }, id: true },
        });
      }
    },
  );
});
