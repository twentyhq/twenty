import { beforeEach, describe, expect, it, vi } from 'vitest';

import importCallRecordingTranscriptLogicFunction, {
  importCallRecordingTranscriptHandler,
} from 'src/logic-functions/import-call-recording-transcript';

const importCallRecordingArtifactsMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/import-call-recording-artifacts.util',
  () => ({
    importCallRecordingArtifacts: importCallRecordingArtifactsMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

describe('import-call-recording-transcript', () => {
  beforeEach(() => {
    importCallRecordingArtifactsMock.mockReset();
    importCallRecordingArtifactsMock.mockResolvedValue({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      outcome: 'call-recording-artifacts-imported',
    });
    coreApiClientMock.mockReset();
  });

  it('is configured as an enqueue-only import worker', () => {
    expect(importCallRecordingTranscriptLogicFunction.success).toBe(true);
    expect(importCallRecordingTranscriptLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'import-call-recording-transcript',
        timeoutSeconds: 250,
      }),
    );
    expect(
      importCallRecordingTranscriptLogicFunction.config,
    ).not.toHaveProperty('httpRouteTriggerSettings');
  });

  it('ignores payload-supplied provider ids', async () => {
    const result = await importCallRecordingTranscriptHandler({
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T14:06:00.000Z',
      event: 'transcript.done',
      externalBotId: 'forged-bot-id',
      externalRecordingId: 'forged-recording-id',
      transcriptId: 'forged-transcript-id',
    });

    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: {
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
      scope: 'transcript',
    });
    expect(result).toEqual(expect.objectContaining({ status: 'imported' }));
  });

  it('skips invalid import payloads without touching the worker flow', async () => {
    const result = await importCallRecordingTranscriptHandler({
      requestedAt: '2026-01-01T14:06:00.000Z',
    });

    expect(importCallRecordingArtifactsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'unknown',
      scope: 'transcript',
      reason: 'invalid call recording artifacts import request',
    });
  });

  it('rethrows an import failure as retryable so the queue redelivers it', async () => {
    importCallRecordingArtifactsMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      importCallRecordingTranscriptHandler({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
