import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FATHOM_DISCONNECTED_MEDIA_CLEANUP_STALLED_PASS_DELAY_MILLISECONDS,
  MAX_FATHOM_DISCONNECTED_MEDIA_CLEANUP_STALLED_PASSES,
} from 'src/constants/fathom.constant';
import { FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const mocks = vi.hoisted(() => ({
  cleanupDisconnectedFathomMediaImports: vi.fn(),
  enqueueJobs: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock(
  'src/logic-functions/utils/cleanup-disconnected-fathom-media-imports.util',
  () => ({
    cleanupDisconnectedFathomMediaImports:
      mocks.cleanupDisconnectedFathomMediaImports,
  }),
);

const { fathomReconcileMediaImportsHandler } =
  await import('src/logic-functions/fathom-reconcile-media-imports');

const DISCONNECTED_ACCOUNT_ID = '7f1d6c2e-3b4a-4c5d-8e9f-0a1b2c3d4e5f';

const STALLED_CLEANUP_RESULT = {
  candidateCount: 2,
  updatedRecordingCount: 0,
  shouldContinue: true,
  skipped: false,
};

describe('fathomReconcileMediaImportsHandler disconnected cleanup', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.cleanupDisconnectedFathomMediaImports.mockResolvedValue(
      STALLED_CLEANUP_RESULT,
    );
  });

  it('chains the next pass immediately while passes keep settling imports', async () => {
    mocks.cleanupDisconnectedFathomMediaImports.mockResolvedValue({
      ...STALLED_CLEANUP_RESULT,
      updatedRecordingCount: 1,
    });

    await fathomReconcileMediaImportsHandler({
      disconnectedAccountId: DISCONNECTED_ACCOUNT_ID,
      disconnectedCleanupStalledPassCount: 3,
    });

    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(mocks.enqueueJobs.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
        payloads: [
          {
            disconnectedAccountId: DISCONNECTED_ACCOUNT_ID,
            disconnectedCleanupStalledPassCount: 0,
          },
        ],
      }),
    );
    expect(mocks.enqueueJobs.mock.calls[0][0].delayMs).toBeUndefined();
  });

  it('delays the next pass when a pass settles nothing', async () => {
    await fathomReconcileMediaImportsHandler({
      disconnectedAccountId: DISCONNECTED_ACCOUNT_ID,
      disconnectedCleanupStalledPassCount: 3,
    });

    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        payloads: [
          {
            disconnectedAccountId: DISCONNECTED_ACCOUNT_ID,
            disconnectedCleanupStalledPassCount: 4,
          },
        ],
        delayMs:
          FATHOM_DISCONNECTED_MEDIA_CLEANUP_STALLED_PASS_DELAY_MILLISECONDS,
      }),
    );
  });

  it('stops scheduling passes once too many passes in a row settle nothing', async () => {
    expect(
      await fathomReconcileMediaImportsHandler({
        disconnectedAccountId: DISCONNECTED_ACCOUNT_ID,
        disconnectedCleanupStalledPassCount:
          MAX_FATHOM_DISCONNECTED_MEDIA_CLEANUP_STALLED_PASSES - 1,
      }),
    ).toEqual(STALLED_CLEANUP_RESULT);
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('does not schedule another pass once every import is settled', async () => {
    mocks.cleanupDisconnectedFathomMediaImports.mockResolvedValue({
      ...STALLED_CLEANUP_RESULT,
      updatedRecordingCount: 2,
      shouldContinue: false,
    });

    await fathomReconcileMediaImportsHandler({
      disconnectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });
});
