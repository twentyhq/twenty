const loadLogConsoleActiveSourceId = async () => {
  jest.resetModules();

  const { logConsoleActiveSourceIdState } =
    await import('@/log-console/states/logConsoleActiveSourceIdState');
  const { createStore } = await import('jotai');

  return createStore().get(logConsoleActiveSourceIdState.atom);
};

describe('logConsoleActiveSourceIdState localStorage hydration', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('restores the saved log source', async () => {
    localStorage.setItem(
      'logConsoleActiveSourceIdState',
      JSON.stringify('app-logs'),
    );

    await expect(loadLogConsoleActiveSourceId()).resolves.toBe('app-logs');
  });

  it('falls back to null for an unknown saved log source', async () => {
    localStorage.setItem(
      'logConsoleActiveSourceIdState',
      JSON.stringify('unknown-source'),
    );

    await expect(loadLogConsoleActiveSourceId()).resolves.toBeNull();
  });
});
