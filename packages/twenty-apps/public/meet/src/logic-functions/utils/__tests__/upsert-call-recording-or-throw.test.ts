import { describe, expect, it, vi } from 'vitest';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

const CALL_RECORDING_ID = '4fb1c0a5-3b62-4c0f-9d0b-5f0f6b1f2a11';

const FIELDS: CallRecordingSyncFields = {
  status: 'COMPLETED',
  externalRecordingId: 'conferenceRecords/first',
  startedAt: '2026-11-17T09:00:00Z',
};

const buildCoreApiClient = ({
  isDeleted,
  isExisting,
}: {
  isDeleted: boolean;
  isExisting: boolean;
}) => ({
  query: vi
    .fn()
    .mockResolvedValueOnce({
      callRecordings: {
        edges: isDeleted ? [{ node: { id: CALL_RECORDING_ID } }] : [],
      },
    })
    .mockResolvedValueOnce({
      callRecordings: {
        edges: isExisting ? [{ node: { id: CALL_RECORDING_ID } }] : [],
      },
    }),
  mutation: vi.fn().mockResolvedValue({}),
});

const upsert = (coreApiClient: ReturnType<typeof buildCoreApiClient>) =>
  upsertCallRecordingOrThrow({
    coreApiClient,
    callRecordingId: CALL_RECORDING_ID,
    fields: FIELDS,
  });

describe('upsertCallRecordingOrThrow', () => {
  it('should create the recording when it does not exist', async () => {
    const coreApiClient = buildCoreApiClient({
      isDeleted: false,
      isExisting: false,
    });

    await expect(upsert(coreApiClient)).resolves.toBe('CREATED');
    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      createCallRecording: {
        __args: { data: { id: CALL_RECORDING_ID, ...FIELDS } },
        id: true,
      },
    });
  });

  it('should update the recording when it exists', async () => {
    const coreApiClient = buildCoreApiClient({
      isDeleted: false,
      isExisting: true,
    });

    await expect(upsert(coreApiClient)).resolves.toBe('UPDATED');
    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      updateCallRecording: {
        __args: { id: CALL_RECORDING_ID, data: FIELDS },
        id: true,
      },
    });
  });

  it('should update the recording another run created at the same moment', async () => {
    const coreApiClient = buildCoreApiClient({
      isDeleted: false,
      isExisting: false,
    });

    coreApiClient.query.mockResolvedValueOnce({
      callRecordings: { edges: [{ node: { id: CALL_RECORDING_ID } }] },
    });
    coreApiClient.mutation
      .mockRejectedValueOnce(new Error('Duplicate id'))
      .mockResolvedValueOnce({});

    await expect(upsert(coreApiClient)).resolves.toBe('UPDATED');
    expect(coreApiClient.query).toHaveBeenCalledTimes(3);
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(2);
    expect(coreApiClient.mutation).toHaveBeenLastCalledWith({
      updateCallRecording: {
        __args: { id: CALL_RECORDING_ID, data: FIELDS },
        id: true,
      },
    });
  });

  it('should rethrow a create failure when the recording still does not exist', async () => {
    const coreApiClient = buildCoreApiClient({
      isDeleted: false,
      isExisting: false,
    });

    coreApiClient.query.mockResolvedValueOnce({
      callRecordings: { edges: [] },
    });
    coreApiClient.mutation.mockRejectedValueOnce(new Error('Not allowed'));

    await expect(upsert(coreApiClient)).rejects.toThrow('Not allowed');
    expect(coreApiClient.query).toHaveBeenCalledTimes(3);
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);
  });

  it('should leave a recording the user deleted untouched', async () => {
    const coreApiClient = buildCoreApiClient({
      isDeleted: true,
      isExisting: true,
    });

    await expect(upsert(coreApiClient)).resolves.toBe('SKIPPED_DELETED');
    expect(coreApiClient.query).toHaveBeenCalledExactlyOnceWith({
      callRecordings: {
        __args: {
          filter: {
            id: { eq: CALL_RECORDING_ID },
            deletedAt: { is: 'NOT_NULL' },
          },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    });
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });
});
