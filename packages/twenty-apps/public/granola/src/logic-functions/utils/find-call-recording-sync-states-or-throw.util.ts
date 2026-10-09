import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';

export const findCallRecordingSyncStatesOrThrow = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<Map<string, CallRecordingSyncState>> => {
  if (callRecordingIds.length === 0) {
    return new Map();
  }

  const result: {
    callRecordings?: { edges?: { node: CallRecordingSyncState }[] };
  } = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { in: callRecordingIds },
          or: [
            { deletedAt: { is: 'NULL' } },
            { deletedAt: { is: 'NOT_NULL' } },
          ],
        },
        first: callRecordingIds.length,
      },
      edges: {
        node: { id: true, deletedAt: true, granolaNoteUpdatedAt: true },
      },
    },
  });

  return new Map(
    (result.callRecordings?.edges ?? []).map(({ node }) => [node.id, node]),
  );
};
