describe('typeORMCoreModuleOptions', () => {
  const originalPoolMaxConnections = process.env.PG_POOL_MAX_CONNECTIONS;
  const originalArgv = process.argv;

  afterEach(() => {
    if (originalPoolMaxConnections === undefined) {
      delete process.env.PG_POOL_MAX_CONNECTIONS;
    } else {
      process.env.PG_POOL_MAX_CONNECTIONS = originalPoolMaxConnections;
    }
    process.argv = originalArgv;
    jest.resetModules();
  });

  it('uses the configured maximum pool size', async () => {
    process.env.PG_POOL_MAX_CONNECTIONS = '40';

    const { typeORMCoreModuleOptions } =
      await import('src/database/typeorm/core/core.datasource');

    expect(typeORMCoreModuleOptions.poolSize).toBe(40);
  });

  it('names command sessions and disables parallel workers for them', async () => {
    process.argv = ['node', '/app/dist/command/command.js', 'upgrade'];

    const { typeORMCoreModuleOptions } =
      await import('src/database/typeorm/core/core.datasource');

    expect(typeORMCoreModuleOptions.extra).toMatchObject({
      application_name: 'twenty-command:upgrade',
      options: '-c max_parallel_workers_per_gather=0',
    });
  });

  it('leaves server sessions unchanged', async () => {
    process.argv = ['node', '/app/dist/main'];

    const { typeORMCoreModuleOptions } =
      await import('src/database/typeorm/core/core.datasource');

    expect(typeORMCoreModuleOptions.extra).not.toHaveProperty(
      'application_name',
    );
    expect(typeORMCoreModuleOptions.extra).not.toHaveProperty('options');
  });
});
