import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildListedTranscript,
  LOGIC_FUNCTION_EXECUTION_CONTEXT,
  serveFirefliesApi,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import firefliesBackfillWorkerLogicFunction from 'src/logic-functions/fireflies-backfill-worker';

const fetchMock = vi.fn();
const enqueueJobMock = vi.hoisted(() => vi.fn());
const getConnectionMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
  getConnection: getConnectionMock,
}));

describe('firefliesBackfillWorkerLogicFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getConnectionMock.mockResolvedValue({
      id: 'connection-1',
      accessToken: 'fireflies-access-token',
    });
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
      firefliesBackfillWorkerLogicFunction.config.handler(
        { connectionId: 'connection-1', days: 0 },
        LOGIC_FUNCTION_EXECUTION_CONTEXT,
      ),
    ).rejects.toThrow('requires a connection id and valid days window');
  });

  it('lists the requested window and enqueues every transcript batch', async () => {
    const transcripts = Array.from({ length: 25 }, (_, callIndex) =>
      buildListedTranscript(
        `call-${callIndex}`,
        Date.parse('2026-06-02T10:00:00.000Z'),
      ),
    );

    serveFirefliesApi([transcripts], fetchMock);

    const result = await firefliesBackfillWorkerLogicFunction.config.handler(
      { connectionId: 'connection-1', days: 30 },
      LOGIC_FUNCTION_EXECUTION_CONTEXT,
    );

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'completed',
        transcriptCount: 25,
        batchCount: 2,
        enqueuedBatchCount: 2,
      }),
    );
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
    expect(getConnectionMock).toHaveBeenCalledWith('connection-1');
    expect(enqueueJobMock.mock.calls[0][0].payload.connectionId).toBe(
      'connection-1',
    );
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

  it('fails discovery with partial enqueue progress so the queue retries it', async () => {
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

    await expect(
      firefliesBackfillWorkerLogicFunction.config.handler(
        { connectionId: 'connection-1', days: 30 },
        LOGIC_FUNCTION_EXECUTION_CONTEXT,
      ),
    ).rejects.toThrow(
      'Fireflies backfill enqueued 1 of 2 batches before enqueue failed: Network failed',
    );
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
  });

  it('fails discovery when Fireflies listing fails', async () => {
    await expect(
      firefliesBackfillWorkerLogicFunction.config.handler(
        { connectionId: 'connection-1', days: 30 },
        LOGIC_FUNCTION_EXECUTION_CONTEXT,
      ),
    ).rejects.toThrow('Fireflies backfill listing failed');
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('fails only the worker bound to a connection that cannot load', async () => {
    getConnectionMock.mockRejectedValue(new Error('reconnect required'));

    await expect(
      firefliesBackfillWorkerLogicFunction.config.handler(
        { connectionId: 'connection-1', days: 30 },
        LOGIC_FUNCTION_EXECUTION_CONTEXT,
      ),
    ).rejects.toThrow('reconnect required');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
