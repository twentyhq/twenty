describe('typeORMCoreModuleOptions', () => {
  const originalPoolMaxConnections = process.env.PG_POOL_MAX_CONNECTIONS;

  afterEach(() => {
    if (originalPoolMaxConnections === undefined) {
      delete process.env.PG_POOL_MAX_CONNECTIONS;
    } else {
      process.env.PG_POOL_MAX_CONNECTIONS = originalPoolMaxConnections;
    }
    jest.resetModules();
  });

  it('uses the configured maximum pool size', async () => {
    process.env.PG_POOL_MAX_CONNECTIONS = '40';

    const { typeORMCoreModuleOptions } =
      await import('src/database/typeorm/core/core.datasource');

    expect(typeORMCoreModuleOptions.poolSize).toBe(40);
  });
});
