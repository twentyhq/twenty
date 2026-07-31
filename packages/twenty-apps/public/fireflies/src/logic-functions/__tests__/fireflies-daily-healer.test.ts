import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import firefliesDailyHealerLogicFunction from 'src/logic-functions/fireflies-daily-healer';

const fetchMock = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

describe('firefliesDailyHealerLogicFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
    fetchMock.mockResolvedValue(
      new Response('invalid request', { status: 400 }),
    );
  });

  afterEach(() => {
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

  it('sweeps a fixed seven-day healing window', async () => {
    await firefliesDailyHealerLogicFunction.config.handler();

    const [, request] = fetchMock.mock.calls[0];
    const { variables } = JSON.parse(String((request as RequestInit).body)) as {
      variables: { fromDate: string; toDate: string; skip: number };
    };

    expect(Date.parse(variables.toDate) - Date.parse(variables.fromDate)).toBe(
      7 * 24 * 60 * 60 * 1_000,
    );
    expect(variables.skip).toBe(0);
  });
});
