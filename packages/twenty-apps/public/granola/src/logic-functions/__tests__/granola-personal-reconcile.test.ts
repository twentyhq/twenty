import { getConnection, kv } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OWN_CONNECTION } from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { granolaPersonalReconcileHandler } from 'src/logic-functions/granola-personal-reconcile';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  getConnection: vi.fn(),
  kv: { get: vi.fn() },
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('granolaPersonalReconcileHandler', () => {
  it('skips connection hooks before activation', async () => {
    vi.stubEnv('GRANOLA_PERSONAL_SYNC_ENABLED', undefined);

    await expect(
      granolaPersonalReconcileHandler({
        connectedAccountId: OWN_CONNECTION.id,
      }),
    ).resolves.toEqual({ success: true, skipped: true });
    expect(kv.get).not.toHaveBeenCalled();
    expect(getConnection).not.toHaveBeenCalled();
  });
});
