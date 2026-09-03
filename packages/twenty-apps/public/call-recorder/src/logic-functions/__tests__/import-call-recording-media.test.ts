import { beforeEach, describe, expect, it, vi } from 'vitest';

import importCallRecordingMediaLogicFunction, {
  importCallRecordingMediaHandler,
} from 'src/logic-functions/import-call-recording-media';

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

describe('import-call-recording-media', () => {
  beforeEach(() => {
    importCallRecordingArtifactsMock.mockReset();
    importCallRecordingArtifactsMock.mockResolvedValue({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'media',
      outcome: 'call-recording-artifacts-imported',
    });
    coreApiClientMock.mockReset();
  });

  it('is configured as an enqueue-only import worker', () => {
    expect(importCallRecordingMediaLogicFunction.success).toBe(true);
    expect(importCallRecordingMediaLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'import-call-recording-media',
        timeoutSeconds: 250,
      }),
    );
    expect(importCallRecordingMediaLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
  });

  it('forwards a valid import payload to the worker flow scoped to media', async () => {
    const result = await importCallRecordingMediaHandler({
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T14:06:00.000Z',
    });

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: {
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
      scope: 'media',
    });
    expect(result).toEqual(expect.objectContaining({ status: 'imported' }));
  });

  it('rethrows an import failure as retryable so the queue redelivers it', async () => {
    importCallRecordingArtifactsMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      importCallRecordingMediaHandler({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
