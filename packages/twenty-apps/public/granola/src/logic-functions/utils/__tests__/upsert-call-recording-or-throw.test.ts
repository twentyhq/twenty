import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

const CALL_RECORDING_ID = 'c4c893ca-3099-4b11-8c50-0c823bb24f36';
const LIVE_SYNC_STATE: CallRecordingSyncState = {
  id: CALL_RECORDING_ID,
  deletedAt: null,
  granolaNoteUpdatedAt: null,
};
const DELETED_SYNC_STATE: CallRecordingSyncState = {
  ...LIVE_SYNC_STATE,
  deletedAt: '2026-09-05T12:00:00Z',
};
const EMPTY_RECORDINGS = { callRecordings: { edges: [] } };
const buildRecordings = (node: CallRecordingSyncState) => ({
  callRecordings: { edges: [{ node }] },
});
const buildCoreApiClient = (): Pick<CoreApiClient, 'query' | 'mutation'> => ({
  query: vi.fn().mockResolvedValue(EMPTY_RECORDINGS),
  mutation: vi
    .fn()
    .mockResolvedValue({ updateCallRecordings: [{ id: CALL_RECORDING_ID }] }),
});

describe('upsertCallRecordingOrThrow', () => {
  it.each([
    ['an update of a live recording', LIVE_SYNC_STATE],
    ['an update after a failed create', undefined],
  ])(
    'skips a recording deleted before %s',
    async (_, syncState: CallRecordingSyncState | undefined) => {
      const coreApiClient = buildCoreApiClient();

      vi.mocked(coreApiClient.query).mockResolvedValueOnce(
        buildRecordings(LIVE_SYNC_STATE),
      );
      vi.mocked(coreApiClient.mutation).mockImplementation(
        async (request: object) => {
          if ('createCallRecording' in request) {
            throw new Error('Duplicate recording');
          }

          return { updateCallRecordings: [] };
        },
      );

      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId: CALL_RECORDING_ID,
          syncState,
          fields: { title: 'Customer call' },
        }),
      ).resolves.toEqual({
        callRecordingId: CALL_RECORDING_ID,
        created: false,
        skipped: true,
      });
      expect(coreApiClient.mutation).toHaveBeenLastCalledWith(
        expect.objectContaining({ updateCallRecordings: expect.anything() }),
      );
    },
  );

  it.each([
    new Error('Duplicate recording'),
    new Error('Response lost after the server committed the recording'),
  ])('recovers a newly visible record after $message', async (error) => {
    const coreApiClient = buildCoreApiClient();

    vi.mocked(coreApiClient.query).mockResolvedValueOnce(
      buildRecordings(LIVE_SYNC_STATE),
    );
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(error);

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        syncState: undefined,
        fields: { title: 'Customer call' },
      }),
    ).resolves.toEqual({ callRecordingId: CALL_RECORDING_ID, created: false });
    expect(coreApiClient.mutation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ updateCallRecordings: expect.anything() }),
    );
  });

  it('leaves a recording deleted during a failed create untouched', async () => {
    const coreApiClient = buildCoreApiClient();

    vi.mocked(coreApiClient.query).mockResolvedValueOnce(
      buildRecordings(DELETED_SYNC_STATE),
    );
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(
      new Error('Duplicate recording'),
    );

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        syncState: undefined,
        fields: { title: 'Customer call' },
      }),
    ).resolves.toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      skipped: true,
    });
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);
  });

  it('propagates a failed create when no record exists', async () => {
    const coreApiClient = buildCoreApiClient();
    const error = new Error('Create failed');
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(error);
    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        syncState: undefined,
        fields: { title: 'Customer call' },
      }),
    ).rejects.toBe(error);
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);
  });

  it('propagates a failed recovery update instead of reporting success', async () => {
    const coreApiClient = buildCoreApiClient();
    const updateError = new Error('Invalid fields');

    vi.mocked(coreApiClient.query).mockResolvedValueOnce(
      buildRecordings(LIVE_SYNC_STATE),
    );
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(
      new Error('Duplicate recording'),
    );
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(updateError);

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        syncState: undefined,
        fields: { title: 'Customer call' },
      }),
    ).rejects.toBe(updateError);
  });

  it.each([false, true])(
    'preserves transcript arrays on writes (existing: %s)',
    async (isExisting) => {
      const coreApiClient = buildCoreApiClient();
      const transcript = [{ participant: { name: 'Alice' }, words: [] }];
      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId: CALL_RECORDING_ID,
          syncState: isExisting ? LIVE_SYNC_STATE : undefined,
          fields: { transcript },
        }),
      ).resolves.toEqual({
        callRecordingId: CALL_RECORDING_ID,
        created: !isExisting,
      });
      const mutationName = isExisting
        ? 'updateCallRecordings'
        : 'createCallRecording';
      const argumentsForMutation = isExisting
        ? {
            filter: {
              id: { eq: CALL_RECORDING_ID },
              deletedAt: { is: 'NULL' },
            },
            data: { transcript },
          }
        : { data: { id: CALL_RECORDING_ID, transcript } };

      expect(coreApiClient.query).not.toHaveBeenCalled();
      expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
        [mutationName]: { __args: argumentsForMutation, id: true },
      });
    },
  );

  it('skips a soft-deleted recording without writing', async () => {
    const coreApiClient = buildCoreApiClient();
    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        syncState: DELETED_SYNC_STATE,
        fields: { title: 'Customer call' },
      }),
    ).resolves.toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      skipped: true,
    });
    expect(coreApiClient.query).not.toHaveBeenCalled();
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });
});
