import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_IDS_PER_QUERY } from 'src/constants/fathom.constant';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

export const listCallRecordingIdsImportedByOtherConnections = async ({
  coreApiClient,
  callRecordingIds,
  connectedAccountId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
  connectedAccountId: string;
}): Promise<Set<string>> => {
  const importedCallRecordingIds = new Set<string>();

  for (const queriedCallRecordingIds of chunkIntoBatches(
    callRecordingIds,
    CALL_RECORDING_IDS_PER_QUERY,
  )) {
    const queryResult = await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: { id: { in: queriedCallRecordingIds } },
          first: queriedCallRecordingIds.length,
        },
        edges: {
          node: {
            id: true,
            fathomRecordingImports: {
              __args: { first: 1 },
              edges: { node: { connectedAccountId: true } },
            },
          },
        },
      },
    });

    for (const edge of queryResult.callRecordings?.edges ?? []) {
      const id = edge?.node?.id;
      const importingConnectedAccountId =
        edge?.node?.fathomRecordingImports?.edges[0]?.node?.connectedAccountId;

      if (
        isNonEmptyString(id) &&
        isNonEmptyString(importingConnectedAccountId) &&
        importingConnectedAccountId !== connectedAccountId
      ) {
        importedCallRecordingIds.add(id);
      }
    }
  }

  return importedCallRecordingIds;
};
