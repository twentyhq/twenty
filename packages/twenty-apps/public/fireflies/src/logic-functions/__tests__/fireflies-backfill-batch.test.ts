import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  answerTwentyQueries,
  serveFirefliesApi,
  setUpImportMissingFirefliesCallsTest,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import firefliesBackfillBatchLogicFunction from 'src/logic-functions/fireflies-backfill-batch';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

const fetchMock = vi.fn();

describe('firefliesBackfillBatchLogicFunction', () => {
  beforeEach(() => {
    setUpImportMissingFirefliesCallsTest({
      fetchMock,
      queryMock,
      mutationMock,
    });
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured as an enqueue-only batch importer', () => {
    expect(firefliesBackfillBatchLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'fireflies-backfill-batch',
        timeoutSeconds: 900,
      }),
    );
    expect(firefliesBackfillBatchLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(firefliesBackfillBatchLogicFunction.config).not.toHaveProperty(
      'cronTriggerSettings',
    );
  });

  it('imports the calls listed in the raw job payload', async () => {
    serveFirefliesApi([], fetchMock);
    vi.useFakeTimers();

    const resultPromise = firefliesBackfillBatchLogicFunction.config.handler({
      transcriptIds: ['call-1', 'call-2'],
    });

    await vi.runAllTimersAsync();

    const result = await resultPromise;

    expect(result).toEqual({
      status: 'completed',
      importedCallCount: 2,
      erroredCallCount: 0,
      skippedCallCount: 0,
    });
    expect(mutationMock).toHaveBeenCalledTimes(2);
  });

  it('skips already synced calls without calling Fireflies', async () => {
    serveFirefliesApi([], fetchMock);
    answerTwentyQueries({
      queryMock,
      callRecordings: [
        {
          id: computeCallRecordingIdForFirefliesMeeting('call-1'),
          transcript: [{ text: 'already imported' }],
          summary: { markdown: 'Already imported' },
        },
      ],
    });

    const result = await firefliesBackfillBatchLogicFunction.config.handler({
      transcriptIds: ['call-1'],
    });

    expect(result).toEqual(
      expect.objectContaining({ status: 'completed', skippedCallCount: 1 }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws on a Fireflies rate limit so the queue retries the job', async () => {
    const consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    vi.useFakeTimers();
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ errors: [{ message: 'too many requests' }] }),
          { status: 429 },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = firefliesBackfillBatchLogicFunction.config.handler({
      transcriptIds: ['call-1'],
    });
    const resultExpectation = expect(resultPromise).rejects.toThrow(
      'transient Fireflies API error',
    );

    await vi.runAllTimersAsync();
    await resultExpectation;

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[fireflies] Backfill batch processed',
      {
        importedCallCount: 0,
        erroredCallCount: 0,
        skippedCallCount: 0,
      },
    );
  });

  it('throws on an invalid job payload', async () => {
    await expect(
      firefliesBackfillBatchLogicFunction.config.handler({ transcriptIds: [] }),
    ).rejects.toThrow('non-empty transcriptIds list');
  });

  it('throws when the Fireflies api key is missing', async () => {
    vi.stubEnv('FIREFLIES_API_KEY', '');

    await expect(
      firefliesBackfillBatchLogicFunction.config.handler({
        transcriptIds: ['call-1'],
      }),
    ).rejects.toThrow('Fireflies is not configured');
  });
});
