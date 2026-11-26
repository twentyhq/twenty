const loadLogConsoleTimeRange = async () => {
  jest.resetModules();

  const { logConsoleTimeRangeState } =
    await import('@/log-console/states/logConsoleTimeRangeState');
  const { createStore } = await import('jotai');

  return createStore().get(logConsoleTimeRangeState.atom);
};

describe('logConsoleTimeRangeState localStorage hydration', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it.each(['7d', 'today'])(
    'restores the saved time range %s',
    async (timeRange) => {
      localStorage.setItem(
        'logConsoleTimeRangeState',
        JSON.stringify(timeRange),
      );

      await expect(loadLogConsoleTimeRange()).resolves.toBe(timeRange);
    },
  );

  it.each(['unknown', 'constructor', 'toString'])(
    'falls back to 24h for the invalid saved time range %s',
    async (timeRange) => {
      localStorage.setItem(
        'logConsoleTimeRangeState',
        JSON.stringify(timeRange),
      );

      await expect(loadLogConsoleTimeRange()).resolves.toBe('24h');
    },
  );
});
