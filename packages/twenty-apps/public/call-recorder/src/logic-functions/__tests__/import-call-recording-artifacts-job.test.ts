import { beforeEach, describe, expect, it, vi } from 'vitest';

import importJobLogicFunction, {
  importCallRecordingArtifactsJobHandler,
} from 'src/logic-functions/import-call-recording-artifacts-job';

const importCallRecordingArtifactsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock(
  'src/logic-functions/flows/import-call-recording-artifacts.util',
  () => ({
    importCallRecordingArtifacts: importCallRecordingArtifactsMock,
  }),
);

describe('importCallRecordingArtifactsJobHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    importCallRecordingArtifactsMock.mockResolvedValue({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('declares no external trigger so it only runs as an enqueued job', () => {
    expect(importJobLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'import-call-recording-artifacts-job',
        timeoutSeconds: 250,
      }),
    );
    expect(importJobLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(importJobLogicFunction.config).not.toHaveProperty(
      'cronTriggerSettings',
    );
  });

  it('runs the import flow for a valid payload', async () => {
    const result = await importCallRecordingArtifactsJobHandler({
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        request: {
          callRecordingId: 'call-recording-1',
          requestedAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    );
    expect(result).toEqual({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('skips a malformed payload instead of failing into queue retries', async () => {
    const result = await importCallRecordingArtifactsJobHandler({
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'call-recording-1',
      reason: 'invalid call recording artifacts import request',
    });
    expect(importCallRecordingArtifactsMock).not.toHaveBeenCalled();
  });

  it('propagates import failures so the queue retries the job', async () => {
    importCallRecordingArtifactsMock.mockRejectedValue(
      new Error('Recall transcript request failed'),
    );

    await expect(
      importCallRecordingArtifactsJobHandler({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).rejects.toThrow('Recall transcript request failed');
  });
});
