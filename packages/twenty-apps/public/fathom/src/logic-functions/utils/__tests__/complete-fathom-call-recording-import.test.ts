import { describe, expect, it, vi } from 'vitest';

import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';

const CALL_RECORDING_ID = 'call-recording-id';

const buildCoreApiClient = (node: Record<string, unknown>) => ({
  query: vi.fn().mockResolvedValue({
    callRecordings: { edges: [{ node }] },
  }),
  mutation: vi
    .fn()
    .mockResolvedValue({ updateCallRecordings: [{ id: CALL_RECORDING_ID }] }),
});

const SETTLED_NODE = {
  id: CALL_RECORDING_ID,
  updatedAt: '2026-08-20T11:00:00.000Z',
  video: [{ fileId: 'video-file-id' }],
  audio: [],
  fathomRecordingImports: {
    edges: [
      {
        node: {
          id: CALL_RECORDING_ID,
          updatedAt: '2026-08-20T11:01:00.000Z',
        },
      },
    ],
  },
};

describe('completeFathomCallRecordingImport', () => {
  it('reads media state without the transcript and lets the guarded write require one', async () => {
    const coreApiClient = buildCoreApiClient(SETTLED_NODE);

    expect(
      await completeFathomCallRecordingImport({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
      }),
    ).toBe(true);
    expect(coreApiClient.query).toHaveBeenCalledOnce();
    expect(
      coreApiClient.query.mock.calls[0][0].callRecordings.edges.node,
    ).not.toHaveProperty('transcript');
    expect(
      coreApiClient.query.mock.calls[0][0].callRecordings.edges.node,
    ).not.toHaveProperty('summary');
    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: CALL_RECORDING_ID },
            updatedAt: { eq: '2026-08-20T11:00:00.000Z' },
            status: { eq: 'PROCESSING' },
            transcript: { like: '[_%]' },
            fathomRecordingImports: {
              id: { eq: CALL_RECORDING_ID },
              updatedAt: { eq: '2026-08-20T11:01:00.000Z' },
            },
          },
          data: { status: 'COMPLETED' },
        },
        id: true,
      },
    });
  });

  it('does not write while media is still being imported', async () => {
    const coreApiClient = buildCoreApiClient({ ...SETTLED_NODE, video: [] });

    expect(
      await completeFathomCallRecordingImport({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
      }),
    ).toBe(false);
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });
});
