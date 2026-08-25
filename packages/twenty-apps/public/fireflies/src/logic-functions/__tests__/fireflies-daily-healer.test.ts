import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import firefliesDailyHealerLogicFunction from 'src/logic-functions/fireflies-daily-healer';
import { LOGIC_FUNCTION_EXECUTION_CONTEXT } from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';

const enqueueJobsMock = vi.hoisted(() => vi.fn());
const listConnectionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
  listConnections: listConnectionsMock,
}));

describe('firefliesDailyHealerLogicFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listConnectionsMock.mockResolvedValue([
      { id: 'connection-1' },
      { id: 'connection-2' },
    ]);
    enqueueJobsMock.mockResolvedValue({ enqueued: true });
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured as the daily healing trigger', () => {
    expect(firefliesDailyHealerLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'fireflies-daily-healer',
        timeoutSeconds: 900,
        cronTriggerSettings: {
          pattern: '0 3 * * *',
        },
      }),
    );
  });

  it('starts a fixed seven-day healing job for every connection', async () => {
    const result = await firefliesDailyHealerLogicFunction.config.handler(
      undefined,
      LOGIC_FUNCTION_EXECUTION_CONTEXT,
    );

    expect(result).toEqual({ outcome: 'started', connectionCount: 2 });
    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        { connectionId: 'connection-1', days: 7 },
        { connectionId: 'connection-2', days: 7 },
      ],
    });
    expect(console.log).toHaveBeenCalledWith(
      '[fireflies] Daily healing discovery started',
      result,
    );
  });

  it('skips healing when no connection exists', async () => {
    listConnectionsMock.mockResolvedValue([]);

    const result = await firefliesDailyHealerLogicFunction.config.handler(
      undefined,
      LOGIC_FUNCTION_EXECUTION_CONTEXT,
    );

    expect(result).toEqual(
      expect.objectContaining({ outcome: 'not-configured' }),
    );
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
