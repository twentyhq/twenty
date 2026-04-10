import { Test, type TestingModule } from '@nestjs/testing';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { type DataSource, type QueryRunner } from 'typeorm';

import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

import { getDataSourceToken } from '@nestjs/typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import {
  UpgradeCommand,
  UpgradeCommandOptions,
} from 'src/database/commands/upgrade-version-command/upgrade.command';
import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-runner.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

const CURRENT_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 1
  ];

type CommandRunnerValues = typeof UpgradeCommand;

type BuildUpgradeCommandModuleArgs = {
  hasWorkspaces: boolean;
  commandRunner: CommandRunnerValues;
  migrations?: FastInstanceCommand[];
};

const buildUpgradeCommandModule = async ({
  hasWorkspaces,
  commandRunner,
  migrations,
}: BuildUpgradeCommandModuleArgs) => {
  const registryProvider = migrations
    ? {
        provide: UpgradeCommandRegistryService,
        useFactory: () => {
          const fakeDiscoveryService = {
            getProviders: () =>
              migrations.map((migration) => ({
                instance: migration,
                metatype: migration.constructor,
              })),
          } as unknown as import('@nestjs/core').DiscoveryService;
          const registry = new UpgradeCommandRegistryService(
            fakeDiscoveryService,
          );

          registry.onModuleInit();

          return registry;
        },
      }
    : {
        provide: UpgradeCommandRegistryService,
        useValue: {
          getUpgradeTape: jest.fn().mockReturnValue([]),
        },
      };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: getDataSourceToken(),
        useValue: {
          runMigrations: jest.fn().mockResolvedValue([]),
        },
      },
      {
        provide: commandRunner,
        useFactory: (
          upgradeCommandRegistryService: UpgradeCommandRegistryService,
          upgradeRunnerService: UpgradeRunnerService,
          workspaceIteratorService: WorkspaceIteratorService,
          workspaceVersionService: WorkspaceVersionService,
          dataSource: DataSource,
        ) => {
          return new commandRunner(
            upgradeCommandRegistryService,
            upgradeRunnerService,
            workspaceIteratorService,
            workspaceVersionService,
            dataSource,
          );
        },
        inject: [
          UpgradeCommandRegistryService,
          UpgradeRunnerService,
          WorkspaceIteratorService,
          WorkspaceVersionService,
          getDataSourceToken(),
        ],
      },
      {
        provide: WorkspaceVersionService,
        useValue: {
          hasActiveOrSuspendedWorkspaces: jest
            .fn()
            .mockResolvedValue(hasWorkspaces),
        },
      },
      {
        provide: UpgradeMigrationService,
        useValue: {
          getCompletedCommandNames: jest
            .fn()
            .mockResolvedValue(new Set<string>()),
          areAllWorkspacesAtCommand: jest.fn().mockResolvedValue(true),
        },
      },
      {
        provide: UpgradeRunnerService,
        useFactory: (
          upgradeMigrationService: UpgradeMigrationService,
          instanceUpgradeService: InstanceUpgradeService,
          workspaceUpgradeService: WorkspaceUpgradeService,
        ) =>
          new UpgradeRunnerService(
            upgradeMigrationService,
            instanceUpgradeService,
            workspaceUpgradeService,
          ),
        inject: [
          UpgradeMigrationService,
          InstanceUpgradeService,
          WorkspaceUpgradeService,
        ],
      },
      {
        provide: InstanceUpgradeService,
        useValue: {
          runFastInstanceCommand: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
          runSlowInstanceCommand: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
        },
      },
      {
        provide: WorkspaceUpgradeService,
        useValue: {
          runWorkspaceCommands: jest.fn().mockResolvedValue(undefined),
        },
      },
      registryProvider,
      {
        provide: WorkspaceIteratorService,
        useValue: {
          iterate: jest.fn().mockImplementation(async (args: any) => {
            const { callback, ...options } = args;
            const workspaceIds = options.workspaceIds ?? ['workspace-1'];

            const report = {
              fail: [] as any[],
              success: [] as any[],
            };

            for (const [index, workspaceId] of workspaceIds.entries()) {
              try {
                await callback({
                  workspaceId,
                  index,
                  total: workspaceIds.length,
                });
                report.success.push({ workspaceId });
              } catch (error) {
                report.fail.push({ error, workspaceId });
              }
            }

            return report;
          }),
        },
      },
    ],
  }).compile();

  return module;
};

describe('UpgradeCommandRunner', () => {
  let upgradeCommandRunner: UpgradeCommand;

  type BuildModuleAndSetupSpiesArgs = {
    hasWorkspaces?: boolean;
    commandRunner?: CommandRunnerValues;
    migrations?: FastInstanceCommand[];
  };

  const buildModuleAndSetupSpies = async ({
    hasWorkspaces = true,
    commandRunner = UpgradeCommand,
    migrations,
  }: BuildModuleAndSetupSpiesArgs) => {
    const module = await buildUpgradeCommandModule({
      commandRunner,
      hasWorkspaces,
      migrations,
    });

    upgradeCommandRunner = module.get(commandRunner);

    jest.spyOn(upgradeCommandRunner['logger'], 'log').mockImplementation();
    jest.spyOn(upgradeCommandRunner['logger'], 'error').mockImplementation();
    jest.spyOn(upgradeCommandRunner['logger'], 'warn').mockImplementation();

    return module;
  };

  it('should delegate workspace upgrade to WorkspaceUpgradeService', async () => {
    const module = await buildModuleAndSetupSpies({});

    const workspaceUpgradeService = module.get(WorkspaceUpgradeService);

    const passedParams: string[] = [];
    const options: UpgradeCommandOptions = {};

    await upgradeCommandRunner.run(passedParams, options);

    expect(workspaceUpgradeService.runWorkspaceCommands).not.toHaveBeenCalled();
  });

  it('should call runFastInstanceCommand for each current-version instance command', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class AddIndexToUsers1770000000000 implements FastInstanceCommand {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    @RegisteredInstanceCommand(CURRENT_VERSION, 1771000000000)
    class AddColumnToAccounts1771000000000 implements FastInstanceCommand {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const addIndex = new AddIndexToUsers1770000000000();
    const addColumn = new AddColumnToAccounts1771000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [addIndex, addColumn],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    await upgradeCommandRunner.run([], {});

    expect(instanceUpgradeService.runFastInstanceCommand).toHaveBeenCalledTimes(
      2,
    );
    expect(
      instanceUpgradeService.runFastInstanceCommand,
    ).toHaveBeenNthCalledWith(1, {
      command: addIndex,
      name: `${CURRENT_VERSION}_AddIndexToUsers1770000000000_1770000000000`,
    });
    expect(
      instanceUpgradeService.runFastInstanceCommand,
    ).toHaveBeenNthCalledWith(2, {
      command: addColumn,
      name: `${CURRENT_VERSION}_AddColumnToAccounts1771000000000_1771000000000`,
    });
  });

  it('should propagate errors from runFastInstanceCommand', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class FailingMigration1770000000000 implements FastInstanceCommand {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const module = await buildModuleAndSetupSpies({
      migrations: [new FailingMigration1770000000000()],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    (
      instanceUpgradeService.runFastInstanceCommand as jest.Mock
    ).mockResolvedValue({
      status: 'failed',
      error: new Error('SQL error'),
    });

    await expect(upgradeCommandRunner.run([], {})).rejects.toThrow('SQL error');
  });

  it('should call runSlowInstanceCommand for each current-version slow command', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1780000000000, {
      type: 'slow',
    })
    class SlowMigration1780000000000 implements SlowInstanceCommand {
      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const slowMigration = new SlowMigration1780000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [slowMigration],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    await upgradeCommandRunner.run([], {});

    expect(instanceUpgradeService.runSlowInstanceCommand).toHaveBeenCalledTimes(
      1,
    );
    expect(instanceUpgradeService.runSlowInstanceCommand).toHaveBeenCalledWith({
      command: slowMigration,
      name: `${CURRENT_VERSION}_SlowMigration1780000000000_1780000000000`,
      skipDataMigration: false,
    });
  });

  it('should run slow commands after fast commands but before workspace commands', async () => {
    const executionOrder: string[] = [];

    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class FastMigration1770000000000 implements FastInstanceCommand {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    @RegisteredInstanceCommand(CURRENT_VERSION, 1780000000000, {
      type: 'slow',
    })
    class SlowMigration1780000000000 implements SlowInstanceCommand {
      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const module = await buildModuleAndSetupSpies({
      migrations: [
        new FastMigration1770000000000(),
        new SlowMigration1780000000000(),
      ],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    (
      instanceUpgradeService.runFastInstanceCommand as jest.Mock
    ).mockImplementation(async () => {
      executionOrder.push('fast');

      return { status: 'success' };
    });

    (
      instanceUpgradeService.runSlowInstanceCommand as jest.Mock
    ).mockImplementation(async () => {
      executionOrder.push('slow');

      return { status: 'success' };
    });

    const workspaceIteratorService = module.get(WorkspaceIteratorService);

    (workspaceIteratorService.iterate as jest.Mock).mockImplementation(
      async () => {
        executionOrder.push('workspace');

        return { success: [], fail: [] };
      },
    );

    await upgradeCommandRunner.run([], {});

    expect(executionOrder).toStrictEqual(['fast', 'slow', 'workspace']);
  });

  it('should pass skipDataMigration: true on fresh install (no workspaces)', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1780000000000, {
      type: 'slow',
    })
    class SlowMigrationFreshInstall implements SlowInstanceCommand {
      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const module = await buildModuleAndSetupSpies({
      hasWorkspaces: false,
      migrations: [new SlowMigrationFreshInstall()],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    await upgradeCommandRunner.run([], {});

    expect(instanceUpgradeService.runSlowInstanceCommand).toHaveBeenCalledWith({
      command: expect.any(SlowMigrationFreshInstall),
      name: `${CURRENT_VERSION}_SlowMigrationFreshInstall_1780000000000`,
      skipDataMigration: true,
    });
  });

  it('should propagate errors from runSlowInstanceCommand', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1780000000000, {
      type: 'slow',
    })
    class FailingSlowMigration implements SlowInstanceCommand {
      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const module = await buildModuleAndSetupSpies({
      migrations: [new FailingSlowMigration()],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    (
      instanceUpgradeService.runSlowInstanceCommand as jest.Mock
    ).mockResolvedValue({
      status: 'failed',
      error: new Error('Data migration error'),
    });

    await expect(upgradeCommandRunner.run([], {})).rejects.toThrow(
      'Data migration error',
    );
  });

  describe('Version barrier', () => {
    const failingTestUseCases: EachTestingContext<{
      description: string;
    }>[] = [
      {
        title:
          'should abort upgrade when workspace commands fail (version barrier)',
        context: {
          description:
            'The version barrier prevents proceeding to the next version block when workspace failures occur',
        },
      },
    ];

    it.each(eachTestingContextFilter(failingTestUseCases))(
      '$title',
      async () => {
        @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
        class FastMigration1770000000000 implements FastInstanceCommand {
          async up(_queryRunner: QueryRunner) {}
          async down(_queryRunner: QueryRunner) {}
        }

        const module = await buildModuleAndSetupSpies({
          migrations: [new FastMigration1770000000000()],
        });

        const workspaceIteratorService = module.get(WorkspaceIteratorService);

        (workspaceIteratorService.iterate as jest.Mock).mockResolvedValue({
          success: [],
          fail: [{ workspaceId: 'ws-1', error: new Error('fail') }],
        });

        await expect(upgradeCommandRunner.run([], {})).rejects.toThrow(
          'workspace failure',
        );
      },
    );
  });

  it('should skip already completed instance commands', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class AlreadyDone1770000000000 implements FastInstanceCommand {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    @RegisteredInstanceCommand(CURRENT_VERSION, 1771000000000)
    class NotDone1771000000000 implements FastInstanceCommand {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const alreadyDone = new AlreadyDone1770000000000();
    const notDone = new NotDone1771000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [alreadyDone, notDone],
    });

    const upgradeMigrationService = module.get(UpgradeMigrationService);

    (
      upgradeMigrationService.getCompletedCommandNames as jest.Mock
    ).mockResolvedValue(
      new Set([
        `${CURRENT_VERSION}_AlreadyDone1770000000000_1770000000000`,
      ]),
    );

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    await upgradeCommandRunner.run([], {});

    expect(instanceUpgradeService.runFastInstanceCommand).toHaveBeenCalledTimes(
      1,
    );
    expect(instanceUpgradeService.runFastInstanceCommand).toHaveBeenCalledWith({
      command: notDone,
      name: `${CURRENT_VERSION}_NotDone1771000000000_1771000000000`,
    });
  });
});
