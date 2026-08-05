import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-job-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { SUMMARY_JOB_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/summary-job-stagger-milliseconds';
import { enqueueCallRecordingSummaryJobs } from 'src/logic-functions/data/enqueue-call-recording-summary-jobs.util';

const enqueueJobMock = vi.hoisted(() => vi.fn());
const ENQUEUE_MAX_DELAY_TEST_CAP = vi.hoisted(() => 20_000);

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

vi.mock(
  'src/logic-functions/constants/enqueue-max-delay-milliseconds',
  () => ({
    ENQUEUE_MAX_DELAY_MILLISECONDS: ENQUEUE_MAX_DELAY_TEST_CAP,
  }),
);

describe('enqueueCallRecordingSummaryJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('enqueues one staggered job per recording, capped at the queue horizon', async () => {
    const result = await enqueueCallRecordingSummaryJobs({
      callRecordingIds: [
        'call-recording-1',
        'call-recording-2',
        'call-recording-3',
      ],
    });

    expect(result).toEqual({ enqueuedJobCount: 3 });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(1, {
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { callRecordingId: 'call-recording-1' },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 0,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(2, {
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { callRecordingId: 'call-recording-2' },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: SUMMARY_JOB_STAGGER_MILLISECONDS,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(3, {
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { callRecordingId: 'call-recording-3' },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: ENQUEUE_MAX_DELAY_TEST_CAP,
    });
  });

  it('throws partial progress without enqueueing later jobs', async () => {
    const enqueueError = new Error('Network failed');

    enqueueJobMock
      .mockResolvedValueOnce({
        enqueued: true,
        logicFunctionUniversalIdentifier:
          GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      })
      .mockRejectedValueOnce(enqueueError);

    await expect(
      enqueueCallRecordingSummaryJobs({
        callRecordingIds: [
          'call-recording-1',
          'call-recording-2',
          'call-recording-3',
        ],
      }),
    ).rejects.toMatchObject({
      message:
        'call recording summary generation enqueued 1 of 3 jobs before enqueue failed: Network failed',
      cause: enqueueError,
    });
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
  });
});
