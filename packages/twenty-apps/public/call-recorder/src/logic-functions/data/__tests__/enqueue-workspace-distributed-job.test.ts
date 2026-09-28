import { afterEach, describe, expect, it, vi } from 'vitest';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { WORKSPACE_DISTRIBUTION_WINDOW_MS } from 'src/logic-functions/constants/workspace-distribution-window-ms';
import { enqueueWorkspaceDistributedJob } from 'src/logic-functions/data/enqueue-workspace-distributed-job.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

describe('enqueueWorkspaceDistributedJob', () => {
  afterEach(() => {
    enqueueJobsMock.mockReset();
  });

  it('enqueues one job for the function at the workspace delay', async () => {
    enqueueJobsMock.mockResolvedValue(undefined);

    const { delayMs } = await enqueueWorkspaceDistributedJob({
      workspaceId: '20202020-1111-4444-8888-303030303030',
      logicFunctionUniversalIdentifier: 'logic-function-universal-identifier',
      stepLabel: 'recovery enqueueing',
    });

    expect(delayMs).toBeGreaterThanOrEqual(0);
    expect(delayMs).toBeLessThan(WORKSPACE_DISTRIBUTION_WINDOW_MS);
    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier: 'logic-function-universal-identifier',
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });
  });

  it('reports a failed enqueue as retryable', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));

    await expect(
      enqueueWorkspaceDistributedJob({
        workspaceId: '20202020-1111-4444-8888-303030303030',
        logicFunctionUniversalIdentifier: 'logic-function-universal-identifier',
        stepLabel: 'recovery enqueueing',
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('recovery enqueueing failed'),
    });
  });
});
