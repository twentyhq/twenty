import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_MEDIA_STATE_NODE_SELECTION } from 'src/constants/call-recording-media-state-node-selection.constant';
import { CALL_RECORDING_WITH_TRANSCRIPT_FILTER } from 'src/constants/call-recording-with-transcript-filter.constant';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { listCallRecordingSyncStates } from 'src/logic-functions/utils/list-call-recording-sync-states.util';

export const findDeletedOrCompletedCallRecordings = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<Map<string, CallRecordingSyncState>> => {
  const callRecordings = await listCallRecordingSyncStates({
    coreApiClient,
    callRecordingIds,
    filter: {
      or: [
        { deletedAt: { is: 'NOT_NULL' } },
        {
          status: { eq: 'COMPLETED' },
          ...CALL_RECORDING_WITH_TRANSCRIPT_FILTER,
        },
      ],
    },
    nodeSelection: {
      ...CALL_RECORDING_MEDIA_STATE_NODE_SELECTION,
      deletedAt: true,
      status: true,
      title: true,
      recordingRequestStatus: true,
      startedAt: true,
      endedAt: true,
      summary: { markdown: true },
    },
  });

  return new Map(
    [...callRecordings].map(([callRecordingId, callRecording]) => [
      callRecordingId,
      { ...callRecording, hasTranscript: !callRecording.isDeleted },
    ]),
  );
};
