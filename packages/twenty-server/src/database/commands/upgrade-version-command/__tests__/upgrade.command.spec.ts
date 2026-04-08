import { Test, type TestingModule } from '@nestjs/testing';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  type DataSource,
  type MigrationInterface,
  type QueryRunner,
} from 'typeorm';

import { getDataSourceToken } from '@nestjs/typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import {
  UpgradeCommand,
  UpgradeCommandOptions,
} from 'src/database/commands/upgrade-version-command/upgrade.command';
import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import { compareVersionMajorAndMinor } from 'src/utils/version/compare-version-minor-and-major';

const CURRENT_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 1
  ];
const PREVIOUS_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 2
  ];

type CommandRunnerValues = typeof UpgradeCommand;

const generateMockWorkspace = (overrides?: Partial<WorkspaceEntity>) =>
  ({
    id: 'workspace-id',
    version: PREVIOUS_VERSION,
    createdAt: new Date(),
    updatedAt: new Date(),
    allowImpersonation: false,
    isPublicInviteLinkEnabled: false,
    displayName: 'Test Workspace',
    domainName: 'test',
    inviteHash: 'hash',
    logo: null,
    deletedAt: null,
    activationStatus: 'active',
    workspaceMembersCount: 1,
    ...overrides,
  }) as WorkspaceEntity;

type BuildUpgradeCommandModuleArgs = {
  workspaces: WorkspaceEntity[];
  appVersion: string | null;
  commandRunner: CommandRunnerValues;
  migrations?: MigrationInterface[];
};
const buildUpgradeCommandModule = async ({
  workspaces,
  appVersion,
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
          getInstanceCommandsForVersion: jest.fn().mockReturnValue([]),
          getWorkspaceCommandsForVersion: jest.fn().mockReturnValue([]),
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
          coreEngineVersionService: CoreEngineVersionService,
          workspaceVersionService: WorkspaceVersionService,
          upgradeCommandRegistryService: UpgradeCommandRegistryService,
          instanceUpgradeService: InstanceUpgradeService,
          workspaceIteratorService: WorkspaceIteratorService,
          workspaceUpgradeService: WorkspaceUpgradeService,
          dataSource: DataSource,
        ) => {
          return new commandRunner(
            coreEngineVersionService,
            workspaceVersionService,
            upgradeCommandRegistryService,
            instanceUpgradeService,
            workspaceIteratorService,
            workspaceUpgradeService,
            dataSource,
          );
        },
        inject: [
          CoreEngineVersionService,
          WorkspaceVersionService,
          UpgradeCommandRegistryService,
          InstanceUpgradeService,
          WorkspaceIteratorService,
          WorkspaceUpgradeService,
          getDataSourceToken(),
        ],
      },
      {
        provide: TwentyConfigService,
        useValue: {
          get: jest.fn().mockImplementation((key: keyof ConfigVariables) => {
            switch (key) {
              case 'APP_VERSION': {
                return appVersion;
              }
              default: {
                return;
              }
            }
          }),
        },
      },
      CoreEngineVersionService,
      {
        provide: WorkspaceVersionService,
        useValue: {
          hasActiveOrSuspendedWorkspaces: jest
            .fn()
            .mockResolvedValue(workspaces.length > 0),
          getWorkspacesBelowVersion: jest
            .fn()
            .mockImplementation((version: string) => {
              return workspaces.filter((workspace) => {
                if (
                  workspace.version === null ||
                  workspace.version === undefined
                ) {
                  return true;
                }

                try {
                  return (
                    compareVersionMajorAndMinor(workspace.version, version) ===
                    'lower'
                  );
                } catch {
                  return true;
                }
              });
            }),
        },
      },
      {
        provide: InstanceUpgradeService,
        useValue: {
          runSingleMigration: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
        },
      },
      {
        provide: WorkspaceUpgradeService,
        useValue: {
          upgradeWorkspace: jest.fn().mockResolvedValue(undefined),
        },
      },
      registryProvider,
      {
        provide: WorkspaceIteratorService,
        useValue: {
          iterate: jest.fn().mockImplementation(async (args: any) => {
            const { callback, ...options } = args;
            const workspaceIds =
              options.workspaceIds ??
              workspaces.map((workspace) => workspace.id);

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
    numberOfWorkspace?: number;
    workspaceOverride?: Partial<WorkspaceEntity>;
    workspaces?: WorkspaceEntity[];
    appVersion?: string | null;
    commandRunner?: CommandRunnerValues;
    migrations?: MigrationInterface[];
  };
  const buildModuleAndSetupSpies = async ({
    numberOfWorkspace = 1,
    workspaceOverride,
    workspaces,
    commandRunner = UpgradeCommand,
    appVersion = CURRENT_VERSION,
    migrations,
  }: BuildModuleAndSetupSpiesArgs) => {
    const generatedWorkspaces = Array.from(
      { length: numberOfWorkspace },
      (_v, index) =>
        generateMockWorkspace({
          id: `workspace_${index}`,
          ...workspaceOverride,
        }),
    );
    const module = await buildUpgradeCommandModule({
      commandRunner,
      appVersion,
      workspaces: [...generatedWorkspaces, ...(workspaces ?? [])],
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

    expect(workspaceUpgradeService.upgradeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('should call upgradeWorkspace for each workspace', async () => {
    const numberOfWorkspace = 42;

    const module = await buildModuleAndSetupSpies({
      numberOfWorkspace,
    });

    const workspaceUpgradeService = module.get(WorkspaceUpgradeService);

    const passedParams: string[] = [];
    const options: UpgradeCommandOptions = {};

    await upgradeCommandRunner.run(passedParams, options);

    expect(workspaceUpgradeService.upgradeWorkspace).toHaveBeenCalledTimes(
      numberOfWorkspace,
    );
  });

  describe('Workspace upgrade should succeed ', () => {
    const successfulTestUseCases: EachTestingContext<{
      input: Omit<BuildModuleAndSetupSpiesArgs, 'numberOfWorkspace'>;
    }>[] = [
      {
        title: 'even if workspace version and app version differ in patch',
        context: {
          input: {
            appVersion: `v${CURRENT_VERSION}`,
            workspaceOverride: {
              version: `v${PREVIOUS_VERSION.replace('.0', '.12')}`,
            },
          },
        },
      },
      {
        title:
          'even if workspace version and app version differ in patch and semantic',
        context: {
          input: {
            appVersion: `v${CURRENT_VERSION}`,
            workspaceOverride: {
              version: PREVIOUS_VERSION.replace('.0', '.12'),
            },
          },
        },
      },
      {
        title: 'even if app version contains a patch value',
        context: {
          input: {
            appVersion: CURRENT_VERSION.replace('.0', '.24'),
            workspaceOverride: {
              version: PREVIOUS_VERSION.replace('.0', '.12'),
            },
          },
        },
      },
    ];

    it.each(eachTestingContextFilter(successfulTestUseCases))(
      '$title',
      async ({ context: { input } }) => {
        const module = await buildModuleAndSetupSpies(input);

        const workspaceUpgradeService = module.get(WorkspaceUpgradeService);

        const passedParams: string[] = [];
        const options: UpgradeCommandOptions = {};

        await upgradeCommandRunner.run(passedParams, options);

        expect(workspaceUpgradeService.upgradeWorkspace).toHaveBeenCalled();
      },
    );
  });

  it('should call runSingleMigration for each current-version instance command', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class AddIndexToUsers1770000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    @RegisteredInstanceCommand(CURRENT_VERSION, 1771000000000)
    class AddColumnToAccounts1771000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    @RegisteredInstanceCommand(PREVIOUS_VERSION, 1769000000000)
    class DropLegacyTable1769000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    class UndecoratedMigration1768000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const addIndex = new AddIndexToUsers1770000000000();
    const addColumn = new AddColumnToAccounts1771000000000();
    const dropLegacy = new DropLegacyTable1769000000000();
    const undecorated = new UndecoratedMigration1768000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [undecorated, dropLegacy, addIndex, addColumn],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    const passedParams: string[] = [];
    const options: UpgradeCommandOptions = {};

    await upgradeCommandRunner.run(passedParams, options);

    expect(instanceUpgradeService.runSingleMigration).toHaveBeenCalledTimes(2);
    expect(instanceUpgradeService.runSingleMigration).toHaveBeenNthCalledWith(
      1,
      addIndex,
    );
    expect(instanceUpgradeService.runSingleMigration).toHaveBeenNthCalledWith(
      2,
      addColumn,
    );
  });

  it('should skip already-executed instance commands', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class AlreadyRunMigration1770000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const alreadyRun = new AlreadyRunMigration1770000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [alreadyRun],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    (instanceUpgradeService.runSingleMigration as jest.Mock).mockResolvedValue({
      status: 'already-executed',
    });

    const passedParams: string[] = [];
    const options: UpgradeCommandOptions = {};

    await upgradeCommandRunner.run(passedParams, options);

    expect(upgradeCommandRunner['logger'].warn).toHaveBeenCalledWith(
      expect.stringContaining('already executed'),
    );
  });

  it('should throw when a migration fails', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class FailingMigration1770000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const failing = new FailingMigration1770000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [failing],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    (instanceUpgradeService.runSingleMigration as jest.Mock).mockResolvedValue({
      status: 'failed',
      error: new Error('SQL error'),
    });

    const passedParams: string[] = [];
    const options: UpgradeCommandOptions = {};

    await expect(
      upgradeCommandRunner.run(passedParams, options),
    ).rejects.toThrow('Core migration FailingMigration1770000000000 failed');
  });

  it('should log success when a migration succeeds', async () => {
    @RegisteredInstanceCommand(CURRENT_VERSION, 1770000000000)
    class SuccessMigration1770000000000 implements MigrationInterface {
      async up(_queryRunner: QueryRunner) {}
      async down(_queryRunner: QueryRunner) {}
    }

    const success = new SuccessMigration1770000000000();

    const module = await buildModuleAndSetupSpies({
      migrations: [success],
    });

    const instanceUpgradeService = module.get(InstanceUpgradeService);

    const passedParams: string[] = [];
    const options: UpgradeCommandOptions = {};

    await upgradeCommandRunner.run(passedParams, options);

    expect(instanceUpgradeService.runSingleMigration).toHaveBeenCalledWith(
      success,
    );
    expect(upgradeCommandRunner['logger'].log).toHaveBeenCalledWith(
      expect.stringContaining('executed successfully'),
    );
  });

  describe('Workspace upgrade should fail', () => {
    const failingTestUseCases: EachTestingContext<{
      input: Omit<BuildModuleAndSetupSpiesArgs, 'numberOfWorkspace'>;
      expectedErrorMessage: string;
    }>[] = [
      {
        title: 'when workspace version is not equal to fromVersion',
        context: {
          input: {
            workspaceOverride: {
              version: '0.1.0',
            },
          },
          expectedErrorMessage:
            'Unable to run the upgrade command. Aborting the upgrade process.',
        },
      },
      {
        title: 'when workspace version is not defined',
        context: {
          input: {
            workspaceOverride: {
              version: null,
            },
          },
          expectedErrorMessage:
            'Unable to run the upgrade command. Aborting the upgrade process.',
        },
      },
      {
        title: 'when APP_VERSION is not defined',
        context: {
          input: {
            appVersion: null,
          },
          expectedErrorMessage:
            'APP_VERSION is not defined, please double check your env variables',
        },
      },
      {
        title: 'when previous version is not found',
        context: {
          input: {
            appVersion: UPGRADE_COMMAND_SUPPORTED_VERSIONS[0],
          },
          expectedErrorMessage: `No previous version found for version ${UPGRADE_COMMAND_SUPPORTED_VERSIONS[0]}`,
        },
      },
    ];

    it.each(eachTestingContextFilter(failingTestUseCases))(
      '$title',
      async ({ context: { input, expectedErrorMessage } }) => {
        await buildModuleAndSetupSpies(input);

        const passedParams: string[] = [];
        const options = {};

        await expect(
          upgradeCommandRunner.run(passedParams, options),
        ).rejects.toThrow(expectedErrorMessage);
      },
    );
  });
});
