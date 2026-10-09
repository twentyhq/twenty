import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_SYNC_STATE_NODE_SELECTION } from 'src/constants/call-recording-sync-state-node-selection.constant';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { listCallRecordingSyncStates } from 'src/logic-functions/utils/list-call-recording-sync-states.util';

export const findCallRecordingSyncStates = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<Map<string, CallRecordingSyncState>> =>
  listCallRecordingSyncStates({
    coreApiClient,
    callRecordingIds,
    filter: {
      or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
    },
    nodeSelection: {
      ...CALL_RECORDING_SYNC_STATE_NODE_SELECTION,
      summary: { markdown: true, blocknote: true },
      transcript: true,
    },
  });
