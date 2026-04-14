import { uuidv4 } from 'zod';

import {
  type WorkspaceIteratorReport,
  WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
  resetSeedSequenceCounter,
  seedMigration,
  setMockActiveWorkspaceIds,
  testGetLatestMigrationForCommand,
  WS_1,
  WS_2,
} from './utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — initial workspace in future segment (integration)', () => {
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
    resetSeedSequenceCounter();
    setMockActiveWorkspaceIds([]);
    jest.restoreAllMocks();
  });

  it('should upgrade all workspaces when some were activated with isInitial in future segments', async () => {
    // Sequence (3 segments):
    //   [Ic0] | [Wc0, Wc1, Wc2] — seg A | [Ic1, Ic2, Ic3] | [Wc3, Wc4, Wc5] — seg B | [Ic4, Ic5] | [Wc6, Wc7] — seg C
    //
    // WS_1: failed at Wc1 in segment A — needs retry from Wc1
    // WS_2: completed through Wc2 in segment A — needs segments B and C
    // WS_3: isInitial at Wc3 (start of segment B) — skip seg A, join at seg B
    // WS_4: isInitial at Wc6 (start of segment C) — skip seg A and B, join at seg C
    const sequence = [
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic1'),
      makeFastInstance('Ic2'),
      makeSlowInstance('Ic3'),
      makeWorkspace('Wc3'),
      makeWorkspace('Wc4'),
      makeWorkspace('Wc5'),
      makeFastInstance('Ic4'),
      makeFastInstance('Ic5'),
      makeWorkspace('Wc6'),
      makeWorkspace('Wc7'),
    ];

    const WS_3 = uuidv4().toString();
    const WS_4 = uuidv4().toString();

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3, WS_4]);

    await seedMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
    });
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_1,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc3',
      status: 'completed',
      workspaceId: WS_3,
      isInitial: true,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc6',
      status: 'completed',
      workspaceId: WS_4,
      isInitial: true,
    });

    const iteratorService = context.module.get(WorkspaceIteratorService);
    const iterateSpy = iteratorService.iterate as jest.Mock;

    const resumeSpy = jest.spyOn(
      context.runner as any,
      'resumeWorkspaceCommandsFromCursors',
    ) as jest.SpyInstance<
      Promise<WorkspaceIteratorReport>,
      [{ contiguousWorkspaceSteps: { name: string }[] }]
    >;

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2, WS_3, WS_4],
      },
    });

    expect(report.totalFailures).toBe(0);

    expect(resumeSpy).toHaveBeenCalledTimes(3);

    // Segment A
    expect(
      resumeSpy.mock.calls[0][0].contiguousWorkspaceSteps.map(
        (step) => step.name,
      ),
    ).toStrictEqual(['Wc0', 'Wc1', 'Wc2']);

    // Segment B
    expect(
      resumeSpy.mock.calls[1][0].contiguousWorkspaceSteps.map(
        (step) => step.name,
      ),
    ).toStrictEqual(['Wc3', 'Wc4', 'Wc5']);

    // Segment C
    expect(
      resumeSpy.mock.calls[2][0].contiguousWorkspaceSteps.map(
        (step) => step.name,
      ),
    ).toStrictEqual(['Wc6', 'Wc7']);

    const iterateCalls = iterateSpy.mock.calls;

    expect(iterateCalls).toHaveLength(3);

    // Seg A: WS_1 and WS_2 only
    expect(iterateCalls[0][0].workspaceIds).toStrictEqual([WS_1, WS_2]);

    // Seg B: WS_1, WS_2, WS_3
    expect(iterateCalls[1][0].workspaceIds).toStrictEqual([WS_1, WS_2, WS_3]);

    // Seg C: all 4
    expect(iterateCalls[2][0].workspaceIds).toStrictEqual([
      WS_1,
      WS_2,
      WS_3,
      WS_4,
    ]);

    // Instance steps: Ic0 was already completed, Ic1..Ic5 should now be completed too
    for (const name of ['Ic1', 'Ic2', 'Ic3', 'Ic4', 'Ic5']) {
      const migration = await testGetLatestMigrationForCommand(
        context.dataSource,
        { name },
      );

      expect(migration).toEqual(
        expect.objectContaining({ name, status: 'completed', attempt: 1 }),
      );
    }

    // WS_1 retried Wc1 then completed through Wc7
    const ws1Wc1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc1',
      workspaceId: WS_1,
    });

    expect(ws1Wc1).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 2 }),
    );

    const ws1Wc7 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc7',
      workspaceId: WS_1,
    });

    expect(ws1Wc7).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 1 }),
    );

    // WS_2 completed segments B and C
    const ws2Wc7 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc7',
      workspaceId: WS_2,
    });

    expect(ws2Wc7).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 1 }),
    );

    // WS_3 (isInitial at Wc3) skipped seg A, ran seg B and C
    const ws3Wc7 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc7',
      workspaceId: WS_3,
    });

    expect(ws3Wc7).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 1 }),
    );

    // WS_4 (isInitial at Wc6) skipped seg A and B, ran seg C
    const ws4Wc7 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc7',
      workspaceId: WS_4,
    });

    expect(ws4Wc7).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 1 }),
    );
  });
});
