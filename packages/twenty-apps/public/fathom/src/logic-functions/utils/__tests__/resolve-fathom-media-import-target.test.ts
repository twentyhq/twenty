import { describe, expect, it, vi } from 'vitest';

import { resolveFathomMediaImportTarget } from 'src/logic-functions/utils/resolve-fathom-media-import-target.util';

const buildCoreApiClient = (node: Record<string, unknown> | null) => ({
  query: vi.fn(async () => ({
    callRecordings: { edges: node === null ? [] : [{ node }] },
  })),
});

describe('resolveFathomMediaImportTarget', () => {
  it('proceeds when the call recording still has no media', async () => {
    const result = await resolveFathomMediaImportTarget({
      coreApiClient: buildCoreApiClient({
        id: 'call-recording-id',
        externalRecordingId: '123',
        video: [],
        audio: [],
      }),
      callRecordingId: 'call-recording-id',
      recordingId: 123,
    });

    expect(result).toEqual({ status: 'proceed' });
  });

  it('skips a call recording the workspace has since deleted', async () => {
    const result = await resolveFathomMediaImportTarget({
      coreApiClient: buildCoreApiClient(null),
      callRecordingId: 'call-recording-id',
      recordingId: 123,
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'no matching call recording',
    });
  });

  it('refuses a payload pointing at another Fathom recording', async () => {
    const result = await resolveFathomMediaImportTarget({
      coreApiClient: buildCoreApiClient({
        id: 'call-recording-id',
        externalRecordingId: '999',
        video: [],
        audio: [],
      }),
      callRecordingId: 'call-recording-id',
      recordingId: 123,
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'call recording belongs to another Fathom recording',
    });
  });

  it('skips once video has already been imported', async () => {
    const result = await resolveFathomMediaImportTarget({
      coreApiClient: buildCoreApiClient({
        id: 'call-recording-id',
        externalRecordingId: '123',
        video: [{ fileId: 'file-id' }],
        audio: [],
      }),
      callRecordingId: 'call-recording-id',
      recordingId: 123,
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'media already imported',
    });
  });

  it('skips once audio has already been imported', async () => {
    const result = await resolveFathomMediaImportTarget({
      coreApiClient: buildCoreApiClient({
        id: 'call-recording-id',
        externalRecordingId: '123',
        video: [],
        audio: [{ fileId: 'file-id' }],
      }),
      callRecordingId: 'call-recording-id',
      recordingId: 123,
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'media already imported',
    });
  });
});
