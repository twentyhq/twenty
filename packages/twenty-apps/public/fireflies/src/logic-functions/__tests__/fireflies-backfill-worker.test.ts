import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildListedTranscript,
  serveFirefliesApi,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import firefliesBackfillWorkerLogicFunction from 'src/logic-functions/fireflies-backfill-worker';

const fetchMock = vi.fn();
const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

describe('firefliesBackfillWorkerLogicFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    fetchMock.mockImplementation(
      async () => new Response('invalid request', { status: 400 }),
    );
    enqueueJobMock.mockResolvedValue({ enqueued: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured as an enqueue-only discovery worker', () => {
    expect(firefliesBackfillWorkerLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'fireflies-backfill-worker',
        timeoutSeconds: 900,
      }),
    );
    expect(firefliesBackfillWorkerLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(firefliesBackfillWorkerLogicFunction.config).not.toHaveProperty(
      'cronTriggerSettings',
    );
  });

  it('rejects an invalid worker payload', async () => {
    await expect(
      firefliesBackfillWorkerLogicFunction.config.handler({ days: 0 }),
    ).rejects.toThrow('requires a valid days window');
  });

  it('lists the requested window and enqueues every transcript batch', async () => {
    const transcripts = Array.from({ length: 25 }, (_, callIndex) =>
      buildListedTranscript(
        `call-${callIndex}`,
        Date.parse('2026-06-02T10:00:00.000Z'),
      ),
    );

    serveFirefliesApi([transcripts], fetchMock);

    const result = await firefliesBackfillWorkerLogicFunction.config.handler({
      days: 30,
    });

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'completed',
        transcriptCount: 25,
        batchCount: 2,
        enqueuedBatchCount: 2,
      }),
    );
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobMock.mock.calls[0][0].payload.transcriptIds).toHaveLength(
      20,
    );
    expect(enqueueJobMock.mock.calls[1][0].payload.transcriptIds).toHaveLength(
      5,
    );

    const [, request] = fetchMock.mock.calls[0];
    const { variables } = JSON.parse(String((request as RequestInit).body)) as {
      variables: { fromDate: string; toDate: string };
    };

    expect(Date.parse(variables.toDate) - Date.parse(variables.fromDate)).toBe(
      30 * 24 * 60 * 60 * 1_000,
    );
  });

  it('reports partial enqueue progress without retrying completed batches', async () => {
    const transcripts = Array.from({ length: 25 }, (_, callIndex) =>
      buildListedTranscript(
        `call-${callIndex}`,
        Date.parse('2026-06-02T10:00:00.000Z'),
      ),
    );

    serveFirefliesApi([transcripts], fetchMock);
    enqueueJobMock
      .mockResolvedValueOnce({ enqueued: true })
      .mockRejectedValueOnce(new Error('Network failed'));

    const result = await firefliesBackfillWorkerLogicFunction.config.handler({
      days: 30,
    });

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'enqueue-failed',
        batchCount: 2,
        enqueuedBatchCount: 1,
        error: 'Network failed',
      }),
    );
    expect(console.log).toHaveBeenCalledWith(
      '[fireflies] Backfill discovery finished',
      expect.objectContaining({ enqueuedBatchCount: 1 }),
    );
  });

  it('reports a Fireflies listing failure', async () => {
    const result = await firefliesBackfillWorkerLogicFunction.config.handler({
      days: 30,
    });

    expect(result).toEqual(expect.objectContaining({ outcome: 'list-failed' }));
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('skips discovery when the Fireflies api key is missing', async () => {
    vi.stubEnv('FIREFLIES_API_KEY', '');

    const result = await firefliesBackfillWorkerLogicFunction.config.handler({
      days: 30,
    });

    expect(result).toEqual(
      expect.objectContaining({ outcome: 'not-configured' }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });
});
