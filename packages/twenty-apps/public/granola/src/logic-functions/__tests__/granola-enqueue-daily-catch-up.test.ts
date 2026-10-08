import {
  type EnqueueJobsInput,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS } from 'src/constants/granola-history.constant';
import { GRANOLA_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { granolaEnqueueDailyCatchUpHandler } from 'src/logic-functions/granola-enqueue-daily-catch-up';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

const mocks = vi.hoisted(() => ({
  store: new Map<string, unknown>(),
  enqueueJobs: vi.fn<(input: EnqueueJobsInput) => Promise<unknown>>(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  kv: {
    get: async (key: string) => mocks.store.get(key),
    set: async (key: string, value: unknown) => {
      mocks.store.set(key, value);
    },
    delete: async (key: string) => {
      mocks.store.delete(key);
    },
  },
  enqueueJobs: mocks.enqueueJobs,
}));

const API_KEY = 'grn_test_key';

const runCron = (workspaceId: string) =>
  granolaEnqueueDailyCatchUpHandler({}, {
    workspaceId,
  } as LogicFunctionExecutionContext);

const getEnqueuedDelays = () =>
  mocks.enqueueJobs.mock.calls.map(([input]) => input.delayMs);

describe('granolaEnqueueDailyCatchUpHandler', () => {
  beforeEach(() => {
    mocks.store.clear();
    vi.clearAllMocks();
    process.env[GRANOLA_API_KEY_ENV_VAR_NAME] = API_KEY;
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.store.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, {
      registrationId: 'reg-1',
      webhookEndpointId: 'wh-1',
      signingSecret: 'secret',
      apiKeyFingerprint: getGranolaApiKeyFingerprint(API_KEY),
      scopes: ['personal'],
      folderIds: [],
      isInitialBackfillEnqueued: true,
    });
  });

  it('schedules the catch-up inside the distribution window instead of running it now', async () => {
    await runCron('20202020-1111-4444-8888-303030303030');

    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          GRANOLA_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
      }),
    );
    const [delayMs] = getEnqueuedDelays();
    expect(delayMs).toBeGreaterThanOrEqual(0);
    expect(delayMs).toBeLessThan(
      GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS,
    );
  });

  it('spreads workspaces apart while keeping each workspace on a stable slot', async () => {
    await runCron('20202020-1111-4444-8888-303030303030');
    await runCron('20202020-2222-4444-8888-303030303030');
    await runCron('20202020-1111-4444-8888-303030303030');

    const [first, second, firstAgain] = getEnqueuedDelays();
    expect(second).not.toBe(first);
    expect(firstAgain).toBe(first);
  });

  it('enqueues nothing for a workspace that never connected Granola', async () => {
    mocks.store.clear();

    const result = await runCron('20202020-1111-4444-8888-303030303030');

    expect(result).toEqual({ success: true, skipped: true });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });
});
