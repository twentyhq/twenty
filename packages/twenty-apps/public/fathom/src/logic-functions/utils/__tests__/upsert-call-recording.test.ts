import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

const CALL_RECORDING_ID = 'call-recording-1';
const FIELDS = { status: 'PROCESSING' as const };
const SHARE_WITH = [{ everyone: true as const, accessLevel: 'READ' as const }];

const buildCoreApiClient = ({
  exists,
}: {
  exists: boolean;
}): Pick<CoreApiClient, 'query' | 'mutation'> => ({
  query: vi.fn().mockResolvedValue({
    callRecordings: {
      edges: exists ? [{ node: { id: CALL_RECORDING_ID } }] : [],
    },
  }),
  mutation: vi.fn().mockResolvedValue({}),
});

describe('upsertCallRecording', () => {
  it('states who may read the recording when creating it', async () => {
    const coreApiClient = buildCoreApiClient({ exists: false });

    await upsertCallRecording({
      coreApiClient,
      callRecordingId: CALL_RECORDING_ID,
      fields: FIELDS,
      shareWith: SHARE_WITH,
    });

    expect(coreApiClient.mutation).toHaveBeenCalledWith({
      createCallRecording: {
        __args: {
          data: { id: CALL_RECORDING_ID, ...FIELDS },
          shareWith: SHARE_WITH,
        },
        id: true,
      },
    });
  });

  it('leaves the readers untouched when updating an existing recording', async () => {
    const coreApiClient = buildCoreApiClient({ exists: true });

    await upsertCallRecording({
      coreApiClient,
      callRecordingId: CALL_RECORDING_ID,
      fields: FIELDS,
      shareWith: SHARE_WITH,
    });

    expect(coreApiClient.mutation).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: { id: CALL_RECORDING_ID, data: FIELDS },
        id: true,
      },
    });
  });
});
