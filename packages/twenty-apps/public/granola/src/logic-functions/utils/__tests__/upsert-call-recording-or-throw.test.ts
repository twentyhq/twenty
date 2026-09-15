import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

const CALL_RECORDING_ID = 'c4c893ca-3099-4b11-8c50-0c823bb24f36';
const EMPTY_RECORDINGS = { callRecordings: { edges: [] } };
const EXISTING_RECORDINGS = {
  callRecordings: { edges: [{ node: { id: CALL_RECORDING_ID } }] },
};

const buildCoreApiClient = (): Pick<CoreApiClient, 'query' | 'mutation'> => ({
  query: vi.fn().mockResolvedValue(EMPTY_RECORDINGS),
  mutation: vi.fn().mockResolvedValue({}),
});

describe('upsertCallRecordingOrThrow', () => {
  it.each([
    new Error('Duplicate recording'),
    new Error('Response lost after the server committed the recording'),
  ])('recovers a newly visible record after $message', async (error) => {
    const coreApiClient = buildCoreApiClient();

    vi.mocked(coreApiClient.query)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EXISTING_RECORDINGS);
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(error);

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        fields: { title: 'Customer call' },
      }),
    ).resolves.toEqual({ callRecordingId: CALL_RECORDING_ID, created: false });
    expect(coreApiClient.mutation).toHaveBeenNthCalledWith(2, {
      updateCallRecording: {
        __args: { id: CALL_RECORDING_ID, data: { title: 'Customer call' } },
        id: true,
      },
    });
  });

  it('propagates a failed create when no record exists', async () => {
    const coreApiClient = buildCoreApiClient();
    const error = new Error('Create failed');
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(error);
    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        fields: { title: 'Customer call' },
      }),
    ).rejects.toBe(error);
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);
  });

  it('propagates a failed recovery update instead of reporting success', async () => {
    const coreApiClient = buildCoreApiClient();
    const updateError = new Error('Invalid fields');

    vi.mocked(coreApiClient.query)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EXISTING_RECORDINGS);
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(
      new Error('Duplicate recording'),
    );
    vi.mocked(coreApiClient.mutation).mockRejectedValueOnce(updateError);

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        fields: { title: 'Customer call' },
      }),
    ).rejects.toBe(updateError);
  });

  it.each([false, true])(
    'preserves transcript arrays on writes (existing: %s)',
    async (isExisting) => {
      const coreApiClient = buildCoreApiClient();
      const transcript = [{ participant: { name: 'Alice' }, words: [] }];
      vi.mocked(coreApiClient.query)
        .mockResolvedValueOnce(EMPTY_RECORDINGS)
        .mockResolvedValueOnce(
          isExisting ? EXISTING_RECORDINGS : EMPTY_RECORDINGS,
        );
      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId: CALL_RECORDING_ID,
          fields: { transcript },
        }),
      ).resolves.toEqual({
        callRecordingId: CALL_RECORDING_ID,
        created: !isExisting,
      });
      const mutationName = isExisting
        ? 'updateCallRecording'
        : 'createCallRecording';
      const argumentsForMutation = isExisting
        ? { id: CALL_RECORDING_ID, data: { transcript } }
        : { data: { id: CALL_RECORDING_ID, transcript } };

      expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
        [mutationName]: { __args: argumentsForMutation, id: true },
      });
    },
  );

  it('skips a soft-deleted recording without writing', async () => {
    const coreApiClient = buildCoreApiClient();
    vi.mocked(coreApiClient.query).mockResolvedValueOnce(EXISTING_RECORDINGS);
    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        fields: { title: 'Customer call' },
      }),
    ).resolves.toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      skipped: true,
    });
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });
});
