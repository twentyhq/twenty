import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import postInstallLogicFunction, {
  startFirefliesBackfillOnInstallHandler,
} from 'src/logic-functions/start-fireflies-backfill-on-install';

const requestFirefliesBackfillMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/request-fireflies-backfill', () => ({
  requestFirefliesBackfill: requestFirefliesBackfillMock,
}));

describe('start-fireflies-backfill-on-install', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestFirefliesBackfillMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is configured to run on app version upgrades', () => {
    expect(postInstallLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'start-fireflies-backfill-on-install',
        timeoutSeconds: 30,
        shouldRunOnVersionUpgrade: true,
      }),
    );
  });

  it('requests the backfill on install', async () => {
    const result = await startFirefliesBackfillOnInstallHandler();

    expect(result).toEqual({ backfillOutcome: 'backfill-requested' });
    expect(requestFirefliesBackfillMock).toHaveBeenCalledTimes(1);
    expect(requestFirefliesBackfillMock).toHaveBeenCalledWith();
  });

  it('skips the kickoff when FIREFLIES_BACKFILL_DAYS is 0', async () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '0');

    const result = await startFirefliesBackfillOnInstallHandler();

    expect(result).toEqual({ backfillOutcome: 'skipped-disabled' });
    expect(requestFirefliesBackfillMock).not.toHaveBeenCalled();
  });

  it('throws when the kickoff request fails so the message queue retries', async () => {
    requestFirefliesBackfillMock.mockResolvedValue(false);

    await expect(startFirefliesBackfillOnInstallHandler()).rejects.toThrow(
      'Failed to start the Fireflies history backfill',
    );
  });
});
