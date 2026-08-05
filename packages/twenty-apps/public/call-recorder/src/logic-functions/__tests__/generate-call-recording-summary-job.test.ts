import { beforeEach, describe, expect, it, vi } from 'vitest';

import summaryJobLogicFunction, {
  generateCallRecordingSummaryJobHandler,
} from 'src/logic-functions/generate-call-recording-summary-job';

const generateCallRecordingSummaryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock(
  'src/logic-functions/flows/generate-call-recording-summary.util',
  () => ({
    generateCallRecordingSummary: generateCallRecordingSummaryMock,
  }),
);

describe('generateCallRecordingSummaryJobHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateCallRecordingSummaryMock.mockResolvedValue({
      outcome: 'generated',
    });
  });

  it('declares no external trigger so it only runs as an enqueued job', () => {
    expect(summaryJobLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'generate-call-recording-summary-job',
        timeoutSeconds: 240,
      }),
    );
    expect(summaryJobLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(summaryJobLogicFunction.config).not.toHaveProperty(
      'databaseEventTriggerSettings',
    );
  });

  it('generates the summary for a valid payload', async () => {
    const result = await generateCallRecordingSummaryJobHandler({
      callRecordingId: 'call-recording-1',
    });

    expect(generateCallRecordingSummaryMock).toHaveBeenCalledWith(
      expect.anything(),
      { callRecordingId: 'call-recording-1' },
    );
    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'generated',
    });
  });

  it('skips a malformed payload instead of failing into queue retries', async () => {
    const result = await generateCallRecordingSummaryJobHandler({});

    expect(result).toEqual({
      outcome: 'skipped',
      reason: 'invalid call recording summary job payload',
    });
    expect(generateCallRecordingSummaryMock).not.toHaveBeenCalled();
  });

  it('propagates generation failures so the queue retries the job', async () => {
    generateCallRecordingSummaryMock.mockRejectedValue(
      new Error('agent exploded'),
    );

    await expect(
      generateCallRecordingSummaryJobHandler({
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('agent exploded');
  });
});
