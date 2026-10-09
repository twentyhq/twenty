import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_MEDIA_STATE_NODE_SELECTION } from 'src/constants/call-recording-media-state-node-selection.constant';
import { CALL_RECORDING_WITH_TRANSCRIPT_FILTER } from 'src/constants/call-recording-with-transcript-filter.constant';
import { CALL_RECORDING_IDS_PER_QUERY } from 'src/constants/fathom.constant';
import { callRecordingSyncStatesQueryResultSchema } from 'src/logic-functions/schemas/call-recording-sync-states-query-result.schema';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { mapCallRecordingSyncState } from 'src/logic-functions/utils/map-call-recording-sync-state.util';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';
import { isDefined } from 'src/utils/is-defined';

export const findDeletedOrCompletedCallRecordings = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<Map<string, CallRecordingSyncState>> => {
  const callRecordings = new Map<string, CallRecordingSyncState>();

  for (const queriedCallRecordingIds of chunkIntoBatches(
    [...new Set(callRecordingIds)],
    CALL_RECORDING_IDS_PER_QUERY,
  )) {
    const queryResult = await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: {
            id: { in: queriedCallRecordingIds },
            or: [
              { deletedAt: { is: 'NOT_NULL' } },
              {
                status: { eq: 'COMPLETED' },
                ...CALL_RECORDING_WITH_TRANSCRIPT_FILTER,
              },
            ],
          },
          first: queriedCallRecordingIds.length,
        },
        edges: {
          node: {
            ...CALL_RECORDING_MEDIA_STATE_NODE_SELECTION,
            deletedAt: true,
            status: true,
            recordingRequestStatus: true,
            startedAt: true,
            endedAt: true,
            calendarEventId: true,
            summary: { markdown: true },
          },
        },
      },
    });

    for (const edge of callRecordingSyncStatesQueryResultSchema.parse(
      queryResult,
    ).callRecordings?.edges ?? []) {
      if (!isDefined(edge?.node)) {
        continue;
      }

      const callRecording = mapCallRecordingSyncState(edge.node);

      callRecordings.set(callRecording.id, {
        ...callRecording,
        hasTranscript: !callRecording.isDeleted,
      });
    }
  }

  return callRecordings;
};
