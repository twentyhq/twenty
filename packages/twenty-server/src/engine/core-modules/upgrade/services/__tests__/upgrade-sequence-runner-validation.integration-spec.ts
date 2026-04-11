import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeWorkspace,
  seedMigration,
  WS_1,
  WS_2,
} from './utils/upgrade-sequence-runner-integration-test.util';

// These tests share a real database table and must run sequentially
// (maxWorkers: 1 in jest-integration.config.ts ensures this).
describe('UpgradeSequenceRunnerService — validation (integration)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createUpgradeSequenceRunnerIntegrationTestModule();
  }, 30000);

  afterAll(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    await context.module?.close();
    await context.dataSource?.destroy();
  }, 15000);

  beforeEach(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    jest.clearAllMocks();
  });

  it('should throw when no migration history exists', async () => {
    const sequence = [makeFastInstance('Ic1')];

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow(
      'No upgrade migration found — the database may not have been initialized',
    );
  });

  it('should throw when workspace cursors are outside the current slice', async () => {
    // Sequence: [Wc1, Wc2, Ic1, Wc3, Wc4]
    // WS_1 completed up to Wc4 (in slice [Wc3, Wc4])
    // WS_2 only completed Wc1 (in slice [Wc1, Wc2]) — misaligned
    const sequence = [
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc3'),
      makeWorkspace('Wc4'),
    ];

    await seedMigration(context.dataSource, 'Wc1', 'completed', WS_1);
    await seedMigration(context.dataSource, 'Wc2', 'completed', WS_1);
    await seedMigration(context.dataSource, 'Wc1', 'completed', WS_2);
    await seedMigration(context.dataSource, 'Ic1', 'completed');
    await seedMigration(context.dataSource, 'Wc3', 'completed', WS_1);
    await seedMigration(context.dataSource, 'Wc4', 'completed', WS_1);

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [WS_1, WS_2],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('workspaces are not aligned');
  });
});
