import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-job-logic-function-universal-identifier';
import backfillLogicFunction, {
  backfillCallRecordingSummariesHandler,
} from 'src/logic-functions/backfill-call-recording-summaries';

const findCallRecordingIdsMissingSummaryMock = vi.hoisted(() => vi.fn());
const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

vi.mock(
  'src/logic-functions/data/find-call-recording-ids-missing-summary.util',
  () => ({
    findCallRecordingIdsMissingSummary: findCallRecordingIdsMissingSummaryMock,
  }),
);

describe('backfillCallRecordingSummariesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([]);
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('declares no external trigger so it only runs as an enqueued job', () => {
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

  it('returns disabled without discovering when summaries are off', async () => {
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'false');

    const result = await backfillCallRecordingSummariesHandler();

    expect(result).toEqual({ outcome: 'disabled' });
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('short-circuits when no recording is missing a summary', async () => {
    const result = await backfillCallRecordingSummariesHandler();

    expect(result).toEqual({ outcome: 'nothing-to-summarize' });
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('enqueues one summary job per recording missing a summary', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([
      'call-recording-1',
      'call-recording-2',
    ]);

    const result = await backfillCallRecordingSummariesHandler();

    expect(result).toEqual({
      outcome: 'summary-jobs-enqueued',
      enqueuedJobCount: 2,
    });
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payload: { callRecordingId: 'call-recording-1' },
      }),
    );
    expect(enqueueJobMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payload: { callRecordingId: 'call-recording-2' },
      }),
    );
  });
});
