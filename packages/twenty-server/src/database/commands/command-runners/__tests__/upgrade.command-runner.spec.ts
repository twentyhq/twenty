import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { type Repository } from 'typeorm';

import {
  UpgradeCommandRunner,
  type AllCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';
import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

const CURRENT_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 1
  ];
const PREVIOUS_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 2
  ];

class BasicUpgradeCommandRunner extends UpgradeCommandRunner {
  allCommands = Object.fromEntries(
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.map((version) => [version, []]),
  ) as unknown as AllCommands;
}

type CommandRunnerValues = typeof BasicUpgradeCommandRunner;

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
};
const buildUpgradeCommandModule = async ({
  workspaces,
  appVersion,
  commandRunner,
}: BuildUpgradeCommandModuleArgs) => {
  const mockDataSourceService = {
    getLastDataSourceMetadataFromWorkspaceId: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: commandRunner,
        useFactory: (
          workspaceRepository: Repository<WorkspaceEntity>,
          twentyConfigService: TwentyConfigService,
          globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
          dataSourceService: DataSourceService,
          coreEngineVersionService: CoreEngineVersionService,
          workspaceVersionService: WorkspaceVersionService,
          coreMigrationRunnerService: CoreMigrationRunnerService,
        ) => {
          return new commandRunner(
            workspaceRepository,
            twentyConfigService,
            globalWorkspaceOrmManager,
            dataSourceService,
            coreEngineVersionService,
            workspaceVersionService,
            coreMigrationRunnerService,
          );
        },
        inject: [
          getRepositoryToken(WorkspaceEntity),
          TwentyConfigService,
          GlobalWorkspaceOrmManager,
          DataSourceService,
          CoreEngineVersionService,
          WorkspaceVersionService,
          CoreMigrationRunnerService,
        ],
      },
      {
        provide: getRepositoryToken(WorkspaceEntity),
        useValue: {
          findOneByOrFail: jest
            .fn()
            .mockImplementation((args) =>
              workspaces.find((el) => el.id === args.id),
            ),
          update: jest.fn(),
          find: jest.fn().mockResolvedValue(workspaces),
          exists: jest.fn().mockResolvedValue(workspaces.length > 0),
        },
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
      {
        provide: GlobalWorkspaceOrmManager,
        useValue: {
          connect: jest.fn(),
          destroyDataSourceForWorkspace: jest.fn(),
          getDataSourceForWorkspace: jest.fn(),
          executeInWorkspaceContext: jest
            .fn()
            .mockImplementation((fn: () => any, _authContext?: any) => fn()),
        },
      },
      {
        provide: DataSourceService,
        useValue: mockDataSourceService,
      },
      CoreEngineVersionService,
      WorkspaceVersionService,
      {
        provide: CoreMigrationRunnerService,
        useValue: { run: jest.fn().mockResolvedValue(undefined) },
      },
    ],
  }).compile();

  return module;
};

describe('UpgradeCommandRunner', () => {
  let upgradeCommandRunner: BasicUpgradeCommandRunner;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let coreMigrationRunnerService: CoreMigrationRunnerService;

  type BuildModuleAndSetupSpiesArgs = {
    numberOfWorkspace?: number;
    workspaceOverride?: Partial<WorkspaceEntity>;
    workspaces?: WorkspaceEntity[];
    appVersion?: string | null;
    commandRunner?: CommandRunnerValues;
  };
  const buildModuleAndSetupSpies = async ({
    numberOfWorkspace = 1,
    workspaceOverride,
    workspaces,
    commandRunner = BasicUpgradeCommandRunner,
    appVersion = CURRENT_VERSION,
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
    });

    upgradeCommandRunner = module.get(commandRunner);

    jest.spyOn(upgradeCommandRunner['logger'], 'log').mockImplementation();
    jest.spyOn(upgradeCommandRunner['logger'], 'error').mockImplementation();
    jest.spyOn(upgradeCommandRunner['logger'], 'warn').mockImplementation();

    jest.spyOn(upgradeCommandRunner, 'runOnWorkspace');

    coreMigrationRunnerService = module.get(CoreMigrationRunnerService);

    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
  };

  it('should ignore and list as succesfull upgrade on workspace with higher version', async () => {
    const higherVersionWorkspace = generateMockWorkspace({
      id: 'higher_version_workspace',
      version: '42.42.42',
    });

    await buildModuleAndSetupSpies({
      numberOfWorkspace: 0,
      workspaces: [higherVersionWorkspace],
    });
    // @ts-expect-error legacy noImplicitAny
    const passedParams = [];
    const options = {};

    // @ts-expect-error legacy noImplicitAny
    await upgradeCommandRunner.run(passedParams, options);

    const { fail: failReport, success: successReport } =
      upgradeCommandRunner.migrationReport;

    expect(successReport.length).toBe(1);
    expect(failReport.length).toBe(0);

    [upgradeCommandRunner.runOnWorkspace].forEach((fn) =>
      expect(fn).toHaveBeenCalledTimes(1),
    );

    [workspaceRepository.update].forEach((fn) =>
      expect(fn).not.toHaveBeenCalled(),
    );
  });

  it('should run upgrade over several workspaces', async () => {
    const numberOfWorkspace = 42;

    await buildModuleAndSetupSpies({
      numberOfWorkspace,
    });
    // @ts-expect-error legacy noImplicitAny
    const passedParams = [];
    const options = {};

    // @ts-expect-error legacy noImplicitAny
    await upgradeCommandRunner.run(passedParams, options);

    [upgradeCommandRunner.runOnWorkspace].forEach((fn) =>
      expect(fn).toHaveBeenCalledTimes(numberOfWorkspace),
    );
    expect(workspaceRepository.update).toHaveBeenNthCalledWith(
      numberOfWorkspace,
      { id: expect.any(String) },
      { version: CURRENT_VERSION },
    );
    expect(upgradeCommandRunner.migrationReport.success.length).toBe(42);
    expect(upgradeCommandRunner.migrationReport.fail.length).toBe(0);
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
        await buildModuleAndSetupSpies(input);

        // @ts-expect-error legacy noImplicitAny
        const passedParams = [];
        const options = {};

        // @ts-expect-error legacy noImplicitAny
        await upgradeCommandRunner.run(passedParams, options);

        const { fail: failReport, success: successReport } =
          upgradeCommandRunner.migrationReport;

        expect(failReport.length).toBe(0);
        expect(successReport.length).toBe(1);
        expect(coreMigrationRunnerService.run).toHaveBeenCalledTimes(1);
        const { workspaceId } = successReport[0];

        expect(workspaceId).toBe('workspace_0');
      },
    );
  });

  describe('Workspace upgrade should fail', () => {
    const failingTestUseCases: EachTestingContext<{
      input: Omit<BuildModuleAndSetupSpiesArgs, 'numberOfWorkspace'>;
      output?: {
        failReportWorkspaceId: string;
        expectedErrorMessage: string;
      };
    }>[] = [
      {
        title: 'when workspace version is not equal to fromVersion',
        context: {
          input: {
            workspaceOverride: {
              version: '0.1.0',
            },
          },
          output: {
            failReportWorkspaceId: 'workspace_0',
            expectedErrorMessage: `Unable to run the upgrade command. Aborting the upgrade process.\nPlease ensure that all workspaces are on at least the previous minor version (${PREVIOUS_VERSION}).\nIf any workspaces are not on the previous minor version, roll back to that version and run the upgrade command again.`,
          },
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
          output: {
            failReportWorkspaceId: 'workspace_0',
            expectedErrorMessage: `Unable to run the upgrade command. Aborting the upgrade process.\nPlease ensure that all workspaces are on at least the previous minor version (${PREVIOUS_VERSION}).\nIf any workspaces are not on the previous minor version, roll back to that version and run the upgrade command again.`,
          },
        },
      },
      {
        title: 'when APP_VERSION is not defined',
        context: {
          input: {
            appVersion: null,
          },
          output: {
            failReportWorkspaceId: 'global',
            expectedErrorMessage:
              'APP_VERSION is not defined, please double check your env variables',
          },
        },
      },
      {
        title: 'when current version commands are not found',
        context: {
          input: {
            appVersion: '42.0.0',
          },
          output: {
            failReportWorkspaceId: 'global',
            expectedErrorMessage:
              'No command found for version 42.0.0. Please check the commands record.',
          },
        },
      },
      {
        title: 'when previous version is not found',
        context: {
          input: {
            appVersion: UPGRADE_COMMAND_SUPPORTED_VERSIONS[0],
          },
          output: {
            failReportWorkspaceId: 'global',
            expectedErrorMessage: `No previous version found for version ${UPGRADE_COMMAND_SUPPORTED_VERSIONS[0]}. Available versions: ${UPGRADE_COMMAND_SUPPORTED_VERSIONS.join(', ')}`,
          },
        },
      },
    ];

    it.each(eachTestingContextFilter(failingTestUseCases))(
      '$title',
      async ({ context: { input, output } }) => {
        await buildModuleAndSetupSpies(input);

        const passedParams: string[] = [];
        const options = {};

        await upgradeCommandRunner.run(passedParams, options);

        const { fail: failReport, success: successReport } =
          upgradeCommandRunner.migrationReport;

        expect(successReport.length).toBe(0);
        expect(failReport.length).toBe(1);
        const { workspaceId, error } = failReport[0];

        expect(workspaceId).toBe(output?.failReportWorkspaceId ?? 'global');
        expect(error).toEqual(new Error(output?.expectedErrorMessage ?? ''));
      },
    );
  });
});
