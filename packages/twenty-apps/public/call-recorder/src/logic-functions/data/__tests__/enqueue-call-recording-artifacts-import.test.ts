import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-job-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/enqueue-call-recording-artifacts-import.util';

const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

describe('enqueueCallRecordingArtifactsImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('enqueues the import job with queue retries', async () => {
    await enqueueCallRecordingArtifactsImport({
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T00:00:00.000Z',
      },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('wraps enqueue failures with the call recording id', async () => {
    const enqueueError = new Error('Network failed');

    enqueueJobMock.mockRejectedValue(enqueueError);

    await expect(
      enqueueCallRecordingArtifactsImport({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      message:
        'failed to enqueue artifact import for call recording call-recording-1: Network failed',
      cause: enqueueError,
    });
  });
});
