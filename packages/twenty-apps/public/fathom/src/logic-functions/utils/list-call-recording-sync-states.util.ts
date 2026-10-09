import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_IDS_PER_QUERY } from 'src/constants/fathom.constant';
import { callRecordingSyncStatesQueryResultSchema } from 'src/logic-functions/schemas/call-recording-sync-states-query-result.schema';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { mapCallRecordingSyncState } from 'src/logic-functions/utils/map-call-recording-sync-state.util';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';
import { isDefined } from 'src/utils/is-defined';

export const listCallRecordingSyncStates = async ({
  coreApiClient,
  callRecordingIds,
  filter,
  nodeSelection,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
  filter: Record<string, unknown>;
  nodeSelection: Record<string, unknown>;
}): Promise<Map<string, CallRecordingSyncState>> => {
  const callRecordingSyncStates = new Map<string, CallRecordingSyncState>();

  for (const queriedCallRecordingIds of chunkIntoBatches(
    [...new Set(callRecordingIds)],
    CALL_RECORDING_IDS_PER_QUERY,
  )) {
    const queryResult = await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: { id: { in: queriedCallRecordingIds }, ...filter },
          first: queriedCallRecordingIds.length,
        },
        edges: { node: nodeSelection },
      },
    });

    for (const edge of callRecordingSyncStatesQueryResultSchema.parse(
      queryResult,
    ).callRecordings?.edges ?? []) {
      if (isDefined(edge?.node)) {
        callRecordingSyncStates.set(
          edge.node.id,
          mapCallRecordingSyncState(edge.node),
        );
      }
    }
  }

  return callRecordingSyncStates;
};
