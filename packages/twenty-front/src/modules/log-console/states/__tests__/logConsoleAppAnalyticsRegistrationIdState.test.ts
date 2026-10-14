const loadLogConsoleAppAnalyticsRegistrationId = async () => {
  jest.resetModules();

  const { logConsoleAppAnalyticsRegistrationIdState } =
    await import('@/log-console/states/logConsoleAppAnalyticsRegistrationIdState');
  const { createStore } = await import('jotai');

  return createStore().get(logConsoleAppAnalyticsRegistrationIdState.atom);
};

describe('logConsoleAppAnalyticsRegistrationIdState localStorage hydration', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('restores the saved app', async () => {
    localStorage.setItem(
      'logConsoleAppAnalyticsRegistrationIdState',
      JSON.stringify('registration-2'),
    );

    await expect(loadLogConsoleAppAnalyticsRegistrationId()).resolves.toBe(
      'registration-2',
    );
  });

  it('starts without a selected app when nothing is saved', async () => {
    await expect(
      loadLogConsoleAppAnalyticsRegistrationId(),
    ).resolves.toBeNull();
  });
});
