import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
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

  it('enqueues a first transcript import with a fresh request timestamp', async () => {
    await enqueueCallRecordingArtifactsImport({
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          callRecordingId: 'call-recording-1',
          requestedAt: expect.any(String),
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('targets the media import job for the media scope', async () => {
    await enqueueCallRecordingArtifactsImport({
      callRecordingId: 'call-recording-1',
      scope: 'media',
    });

    expect(enqueueJobsMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('propagates enqueue failures to the caller', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      enqueueCallRecordingArtifactsImport({
        callRecordingId: 'call-recording-1',
        scope: 'media',
      }),
    ).rejects.toThrow('Network failed');
  });
});
