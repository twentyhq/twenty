import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';
import { listCallRecordingIdsImportedByOtherConnections } from 'src/logic-functions/utils/list-call-recording-ids-imported-by-other-connections.util';

describe('Fathom call recordings imported by other connections', () => {
  it('lists only recordings whose import belongs to another connection', async () => {
    const coreApiClient = new CoreApiClient();
    const applicationCoreApiClient =
      await createFathomApplicationCoreApiClient();
    const connectedAccountId = randomUUID();
    const importedByOtherConnectionId = randomUUID();
    const importedByThisConnectionId = randomUUID();
    const notImportedId = randomUUID();
    const fixtures = [
      {
        callRecordingId: importedByOtherConnectionId,
        importingConnectedAccountId: randomUUID(),
      },
      {
        callRecordingId: importedByThisConnectionId,
        importingConnectedAccountId: connectedAccountId,
      },
    ];

    for (const { callRecordingId, importingConnectedAccountId } of fixtures) {
      await coreApiClient.mutation({
        createCallRecording: {
          __args: {
            data: {
              id: callRecordingId,
              title: 'Fathom import ownership integration fixture',
              status: 'COMPLETED',
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
              connectedAccountId: importingConnectedAccountId,
            },
          },
          id: true,
        },
      });
    }

    try {
      const importedCallRecordingIds =
        await listCallRecordingIdsImportedByOtherConnections({
          coreApiClient: applicationCoreApiClient,
          callRecordingIds: [
            importedByOtherConnectionId,
            importedByThisConnectionId,
            notImportedId,
          ],
          connectedAccountId,
        });

      expect([...importedCallRecordingIds]).toEqual([
        importedByOtherConnectionId,
      ]);
    } finally {
      for (const { callRecordingId } of fixtures) {
        await coreApiClient.mutation({
          destroyCallRecording: { __args: { id: callRecordingId }, id: true },
        });
      }
    }
  });
});
