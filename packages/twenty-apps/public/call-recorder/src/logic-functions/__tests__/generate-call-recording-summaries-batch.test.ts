import { beforeEach, describe, expect, it, vi } from 'vitest';

import batchLogicFunction, {
  generateCallRecordingSummariesBatchHandler,
} from 'src/logic-functions/generate-call-recording-summaries-batch';

const generateCallRecordingSummariesForIdsMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/generate-call-recording-summaries-for-ids.util',
  () => ({
    generateCallRecordingSummariesForIds:
      generateCallRecordingSummariesForIdsMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

describe('generate-call-recording-summaries-batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateCallRecordingSummariesForIdsMock.mockResolvedValue({
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: [],
      skippedCallRecordingIds: [],
    });
  });

  it('is configured as an enqueue-only batch worker', () => {
    expect(batchLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'generate-call-recording-summaries-batch',
        timeoutSeconds: 900,
      }),
    );
    expect(batchLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(batchLogicFunction.config).not.toHaveProperty('cronTriggerSettings');
  });

  it('generates summaries for the call recordings of its batch payload', async () => {
    const result = await generateCallRecordingSummariesBatchHandler({
      callRecordingIds: ['call-recording-1'],
    });

    expect(generateCallRecordingSummariesForIdsMock).toHaveBeenCalledWith({
      client: expect.anything(),
      callRecordingIds: ['call-recording-1'],
    });
    expect(result).toEqual({
      outcome: 'processed',
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: [],
      skippedCallRecordingIds: [],
    });
  });

  it('skips payloads without call recording ids', async () => {
    expect(await generateCallRecordingSummariesBatchHandler({})).toEqual({
      outcome: 'nothing-selected',
    });
    expect(await generateCallRecordingSummariesBatchHandler(null)).toEqual({
      outcome: 'nothing-selected',
    });
    expect(generateCallRecordingSummariesForIdsMock).not.toHaveBeenCalled();
  });

  it('throws a retryable failure when generation errored for some recordings so the queue redelivers the batch', async () => {
    generateCallRecordingSummariesForIdsMock.mockResolvedValue({
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: ['call-recording-2', 'call-recording-3'],
      skippedCallRecordingIds: [],
    });

    await expect(
      generateCallRecordingSummariesBatchHandler({
        callRecordingIds: [
          'call-recording-1',
          'call-recording-2',
          'call-recording-3',
        ],
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining(
        'summary generation errored for 2 of 3 call recordings',
      ),
    });
  });

  it('does not redeliver a batch whose recordings only produced empty summaries', async () => {
    generateCallRecordingSummariesForIdsMock.mockResolvedValue({
      generatedCallRecordingIds: [],
      failedCallRecordingIds: ['call-recording-1'],
      erroredCallRecordingIds: [],
      skippedCallRecordingIds: [],
    });

    expect(
      await generateCallRecordingSummariesBatchHandler({
        callRecordingIds: ['call-recording-1'],
      }),
    ).toEqual({
      outcome: 'processed',
      generatedCallRecordingIds: [],
      failedCallRecordingIds: ['call-recording-1'],
      erroredCallRecordingIds: [],
      skippedCallRecordingIds: [],
    });
  });

  it('rethrows a batch failure as retryable so the queue redelivers it', async () => {
    generateCallRecordingSummariesForIdsMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      generateCallRecordingSummariesBatchHandler({
        callRecordingIds: ['call-recording-1'],
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
