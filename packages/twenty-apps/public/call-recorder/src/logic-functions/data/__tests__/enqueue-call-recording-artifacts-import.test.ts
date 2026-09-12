import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/enqueue-call-recording-artifacts-import.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

describe('enqueueCallRecordingArtifactsImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobsMock.mockResolvedValue({ enqueued: true, enqueuedJobsCount: 1 });
  });

  it('enqueues each artifact scope as a separate job in one request', async () => {
    await enqueueCallRecordingArtifactsImport({
      callRecordingId: 'call-recording-1',
      scopes: ['transcript', 'media'],
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          callRecordingId: 'call-recording-1',
          requestedAt: expect.any(String),
          scope: 'transcript',
        },
        {
          callRecordingId: 'call-recording-1',
          requestedAt: expect.any(String),
          scope: 'media',
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('propagates enqueue failures to the caller', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      enqueueCallRecordingArtifactsImport({
        callRecordingId: 'call-recording-1',
        scopes: ['media'],
      }),
    ).rejects.toThrow('Network failed');
  });
});
