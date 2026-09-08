import { beforeEach, describe, expect, it, vi } from 'vitest';

import importCallRecordingArtifactsLogicFunction, {
  importCallRecordingArtifactsHandler,
} from 'src/logic-functions/import-call-recording-artifacts';

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

describe('import-call-recording-artifacts', () => {
  beforeEach(() => {
    importCallRecordingArtifactsMock.mockReset();
    importCallRecordingArtifactsMock.mockResolvedValue({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      outcome: 'call-recording-artifacts-imported',
    });
    coreApiClientMock.mockReset();
  });

  it('is configured as an enqueue-only import worker', () => {
    expect(importCallRecordingArtifactsLogicFunction.success).toBe(true);
    expect(importCallRecordingArtifactsLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'import-call-recording-artifacts',
        timeoutSeconds: 250,
      }),
    );
    expect(importCallRecordingArtifactsLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
  });

  it('forwards a valid import payload to the worker flow', async () => {
    const payload = {
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T14:06:00.000Z',
    };

    const result = await importCallRecordingArtifactsHandler(payload);

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: payload,
    });
    expect(result).toEqual({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('ignores payload-supplied provider ids instead of forwarding them', async () => {
    const result = await importCallRecordingArtifactsHandler({
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
    });
    expect(result).toEqual(expect.objectContaining({ status: 'imported' }));
  });

  it('skips invalid import payloads without touching the worker flow', async () => {
    const result = await importCallRecordingArtifactsHandler({
      requestedAt: '2026-01-01T14:06:00.000Z',
    });

    expect(importCallRecordingArtifactsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'unknown',
      reason: 'invalid call recording artifacts import request',
    });
  });

  it('rethrows an import failure as retryable so the queue redelivers it', async () => {
    importCallRecordingArtifactsMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      importCallRecordingArtifactsHandler({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
