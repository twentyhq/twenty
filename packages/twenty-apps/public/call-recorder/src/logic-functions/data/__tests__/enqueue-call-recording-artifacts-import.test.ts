import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-logic-function-universal-identifier';
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

  it('enqueues one import job with a fresh request timestamp', async () => {
    await enqueueCallRecordingArtifactsImport({
      callRecordingId: 'call-recording-1',
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          callRecordingId: 'call-recording-1',
          requestedAt: expect.any(String),
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
      }),
    ).rejects.toThrow('Network failed');
  });
});
