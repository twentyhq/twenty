import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-batch-logic-function-universal-identifier';
import { CALL_RECORDING_SUMMARIES_BATCH_SIZE } from 'src/logic-functions/constants/call-recording-summaries-batch-size';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import backfillLogicFunction, {
  backfillCallRecordingSummariesHandler,
} from 'src/logic-functions/backfill-call-recording-summaries';

const findCallRecordingIdsMissingSummaryMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/data/find-call-recording-ids-missing-summary.util',
  () => ({
    findCallRecordingIdsMissingSummary: findCallRecordingIdsMissingSummaryMock,
  }),
);

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

describe('backfill-call-recording-summaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([]);
    enqueueJobsMock.mockImplementation(async ({ payloads }) => ({
      enqueued: true,
      enqueuedJobsCount: payloads.length,
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is configured as an enqueue-only backfill kickoff', () => {
    expect(backfillLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'backfill-call-recording-summaries',
        timeoutSeconds: 250,
      }),
    );
    expect(backfillLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(backfillLogicFunction.config).not.toHaveProperty(
      'cronTriggerSettings',
    );
  });

  it('returns disabled without enumerating when summaries are off', async () => {
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'false');

    const result = await backfillCallRecordingSummariesHandler();

    expect(result).toEqual({ outcome: 'disabled' });
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('enqueues one batch per group of recordings missing a summary', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue(
      Array.from(
        { length: CALL_RECORDING_SUMMARIES_BATCH_SIZE + 1 },
        (_, callRecordingIndex) => `call-recording-${callRecordingIndex}`,
      ),
    );

    const result = await backfillCallRecordingSummariesHandler();

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          callRecordingIds: expect.arrayContaining(['call-recording-0']),
        },
        {
          callRecordingIds: [
            `call-recording-${CALL_RECORDING_SUMMARIES_BATCH_SIZE}`,
          ],
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
    expect(result).toEqual({
      outcome: 'batches-enqueued',
      callRecordingCount: CALL_RECORDING_SUMMARIES_BATCH_SIZE + 1,
      batchCount: 2,
    });
  });

  it('short-circuits without enqueuing when nothing is missing a summary', async () => {
    const result = await backfillCallRecordingSummariesHandler();

    expect(result).toEqual({ outcome: 'nothing-to-summarize' });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('rethrows an enumeration failure as retryable so the queue redelivers it', async () => {
    findCallRecordingIdsMissingSummaryMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(backfillCallRecordingSummariesHandler()).rejects.toMatchObject(
      {
        name: 'RetryableLogicFunctionError',
        message: expect.stringContaining('Service unavailable'),
      },
    );
  });
});
