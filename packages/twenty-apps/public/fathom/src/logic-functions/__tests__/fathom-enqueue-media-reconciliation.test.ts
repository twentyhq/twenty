import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildLogicFunctionExecutionContext } from 'src/__tests__/utils/logic-function-execution-context.util';
import {
  FATHOM_BACKFILL_JOB_RETRY_LIMIT,
  FATHOM_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS,
} from 'src/constants/fathom.constant';
import { FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const mocks = vi.hoisted(() => ({
  enqueueJobs: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
}));

const { fathomEnqueueMediaReconciliationHandler } =
  await import('src/logic-functions/fathom-enqueue-media-reconciliation');

const buildContext = (workspaceId: string) => ({
  ...buildLogicFunctionExecutionContext(null),
  workspaceId,
});

describe('fathomEnqueueMediaReconciliationHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
  });

  it('enqueues the reconciliation at a stable delay within the window', async () => {
    const context = buildContext('20202020-1111-4444-8888-303030303030');

    const { delayMs } = await fathomEnqueueMediaReconciliationHandler(
      {},
      context,
    );

    expect(delayMs).toBeGreaterThanOrEqual(0);
    expect(delayMs).toBeLessThan(
      FATHOM_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS,
    );
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: FATHOM_BACKFILL_JOB_RETRY_LIMIT,
      delayMs,
    });
    expect(
      (await fathomEnqueueMediaReconciliationHandler({}, context)).delayMs,
    ).toBe(delayMs);
  });

  it('runs different workspaces at different times', async () => {
    const { delayMs: firstDelay } =
      await fathomEnqueueMediaReconciliationHandler(
        {},
        buildContext('20202020-1111-4444-8888-303030303030'),
      );
    const { delayMs: secondDelay } =
      await fathomEnqueueMediaReconciliationHandler(
        {},
        buildContext('20202020-2222-4444-8888-303030303030'),
      );

    expect(firstDelay).not.toBe(secondDelay);
  });

  it('reports a failed enqueue as retryable', async () => {
    mocks.enqueueJobs.mockResolvedValue({ enqueued: false });

    await expect(
      fathomEnqueueMediaReconciliationHandler(
        {},
        buildContext('20202020-1111-4444-8888-303030303030'),
      ),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
  });
});
