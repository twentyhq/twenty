import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

const CALL_RECORDING_ID = 'call-recording-1';
const CREATE_FIELDS = { status: 'PROCESSING' as const };
const UPDATE_FIELDS = { status: 'COMPLETED' as const };
const SHARE_WITH = [{ everyone: true as const, accessLevel: 'READ' as const }];

const buildCoreApiClient = (): Pick<CoreApiClient, 'query' | 'mutation'> => ({
  query: vi.fn().mockResolvedValue({ callRecordings: { edges: [] } }),
  mutation: vi
    .fn()
    .mockResolvedValue({ updateCallRecordings: [{ id: CALL_RECORDING_ID }] }),
});

describe('upsertCallRecording', () => {
  it('states who may read the recording when creating it', async () => {
    const coreApiClient = buildCoreApiClient();

    await upsertCallRecording({
      coreApiClient,
      callRecordingId: CALL_RECORDING_ID,
      createFields: CREATE_FIELDS,
      updateFields: UPDATE_FIELDS,
      expectedUpdatedAt: undefined,
      shareWith: SHARE_WITH,
    });

    expect(coreApiClient.mutation).toHaveBeenCalledWith({
      createCallRecording: {
        __args: {
          data: { id: CALL_RECORDING_ID, ...CREATE_FIELDS },
          shareWith: SHARE_WITH,
        },
        id: true,
      },
    });
  });

  it('leaves the readers untouched when updating an existing recording', async () => {
    const coreApiClient = buildCoreApiClient();

    await upsertCallRecording({
      coreApiClient,
      callRecordingId: CALL_RECORDING_ID,
      createFields: CREATE_FIELDS,
      updateFields: UPDATE_FIELDS,
      expectedUpdatedAt: '2026-09-07T00:00:00.000Z',
      shareWith: SHARE_WITH,
    });

    expect(coreApiClient.mutation).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: CALL_RECORDING_ID },
            updatedAt: { eq: '2026-09-07T00:00:00.000Z' },
          },
          data: UPDATE_FIELDS,
        },
        id: true,
      },
    });
  });
});
