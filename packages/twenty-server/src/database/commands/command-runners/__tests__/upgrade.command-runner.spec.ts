import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { type Repository } from 'typeorm';

import { UpgradeCommandRunner } from 'src/database/commands/command-runners/upgrade.command-runner';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

class BasicUpgradeCommandRunner extends UpgradeCommandRunner {
  allCommands = {
    '1.0.0': {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    },
    '2.0.0': {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    },
  };
}

class InvalidUpgradeCommandRunner extends UpgradeCommandRunner {
  allCommands = {
    invalid: {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    },
    '2.0.0': {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    },
  };
}

type CommandRunnerValues =
  | typeof BasicUpgradeCommandRunner
  | typeof InvalidUpgradeCommandRunner;

const generateMockWorkspace = (overrides?: Partial<Workspace>) =>
  ({
    id: 'workspace-id',
    version: '1.0.0',
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
  }) as Workspace;

type BuildUpgradeCommandModuleArgs = {
  workspaces: Workspace[];
  appVersion: string | null;
  commandRunner: CommandRunnerValues;
};
const buildUpgradeCommandModule = async ({
  workspaces,
  appVersion,
  commandRunner,
}: BuildUpgradeCommandModuleArgs) => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      commandRunner,
      {
        provide: getRepositoryToken(Workspace),
        useValue: {
          findOneByOrFail: jest
            .fn()
            .mockImplementation((args) =>
              workspaces.find((el) => el.id === args.id),
            ),
          update: jest.fn(),
          find: jest.fn().mockResolvedValue(workspaces),
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
        provide: TwentyORMGlobalManager,
        useValue: {
          connect: jest.fn(),
          destroyDataSourceForWorkspace: jest.fn(),
          getDataSourceForWorkspace: jest.fn(),
        },
      },
      {
        provide: SyncWorkspaceMetadataCommand,
        useValue: {
          runOnWorkspace: jest.fn(),
        },
      },
    ],
  }).compile();

  return module;
};

describe('UpgradeCommandRunner', () => {
  let upgradeCommandRunner: BasicUpgradeCommandRunner;
  let workspaceRepository: Repository<Workspace>;
  let syncWorkspaceMetadataCommand: jest.Mocked<SyncWorkspaceMetadataCommand>;
  let runAfterSyncMetadataSpy: jest.SpyInstance;
  let runBeforeSyncMetadataSpy: jest.SpyInstance;
  let runCoreMigrationsSpy: jest.SpyInstance;
  let twentyORMGlobalManagerSpy: TwentyORMGlobalManager;

  type BuildModuleAndSetupSpiesArgs = {
    numberOfWorkspace?: number;
    workspaceOverride?: Partial<Workspace>;
    workspaces?: Workspace[];
    appVersion?: string | null;
    commandRunner?: CommandRunnerValues;
  };
  const buildModuleAndSetupSpies = async ({
    numberOfWorkspace = 1,
    workspaceOverride,
    workspaces,
    commandRunner = BasicUpgradeCommandRunner,
    appVersion = '2.0.0',
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
    runBeforeSyncMetadataSpy = jest.spyOn(
      upgradeCommandRunner,
      'runBeforeSyncMetadata',
    );
    runAfterSyncMetadataSpy = jest.spyOn(
      upgradeCommandRunner,
      'runAfterSyncMetadata',
    );
    jest.spyOn(upgradeCommandRunner, 'runOnWorkspace');
    runCoreMigrationsSpy = jest
      .spyOn(upgradeCommandRunner, 'runCoreMigrations')
      .mockImplementation(() => Promise.resolve());

    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace),
    );
    syncWorkspaceMetadataCommand = module.get(SyncWorkspaceMetadataCommand);
    twentyORMGlobalManagerSpy = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );
  };

  it('should ignore and list as succesfull upgrade on workspace with higher version', async () => {
    const higherVersionWorkspace = generateMockWorkspace({
      id: 'higher_version_workspace',
      version: '42.42.42',
    });
    const appVersion = '2.0.0';

    await buildModuleAndSetupSpies({
      numberOfWorkspace: 0,
      workspaces: [higherVersionWorkspace],
      appVersion,
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

    [
      twentyORMGlobalManagerSpy.destroyDataSourceForWorkspace,
      upgradeCommandRunner.runOnWorkspace,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(1));

    [
      upgradeCommandRunner.runBeforeSyncMetadata,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      upgradeCommandRunner.runAfterSyncMetadata,
      workspaceRepository.update,
    ].forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });

  it('should run upgrade over several workspaces', async () => {
    const numberOfWorkspace = 42;
    const appVersion = '2.0.0';

    await buildModuleAndSetupSpies({
      numberOfWorkspace,
      appVersion,
    });
    // @ts-expect-error legacy noImplicitAny
    const passedParams = [];
    const options = {};

    // @ts-expect-error legacy noImplicitAny
    await upgradeCommandRunner.run(passedParams, options);

    [
      upgradeCommandRunner.runOnWorkspace,
      upgradeCommandRunner.runBeforeSyncMetadata,
      upgradeCommandRunner.runAfterSyncMetadata,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      twentyORMGlobalManagerSpy.destroyDataSourceForWorkspace,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(numberOfWorkspace));
    expect(workspaceRepository.update).toHaveBeenNthCalledWith(
      numberOfWorkspace,
      { id: expect.any(String) },
      { version: appVersion },
    );
    expect(upgradeCommandRunner.migrationReport.success.length).toBe(42);
    expect(upgradeCommandRunner.migrationReport.fail.length).toBe(0);
  });

  it('should run syncMetadataCommand betweensuccessful beforeSyncMetadataUpgradeCommandsToRun and afterSyncMetadataUpgradeCommandsToRun', async () => {
    await buildModuleAndSetupSpies({});
    // @ts-expect-error legacy noImplicitAny
    const passedParams = [];
    const options = {};

    // @ts-expect-error legacy noImplicitAny
    await upgradeCommandRunner.run(passedParams, options);

    [
      upgradeCommandRunner.runOnWorkspace,
      upgradeCommandRunner.runBeforeSyncMetadata,
      upgradeCommandRunner.runAfterSyncMetadata,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      twentyORMGlobalManagerSpy.destroyDataSourceForWorkspace,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(1));

    // Verify order of execution
    const beforeSyncCall = runBeforeSyncMetadataSpy.mock.invocationCallOrder[0];
    const afterSyncCall = runAfterSyncMetadataSpy.mock.invocationCallOrder[0];
    const syncMetadataCall =
      syncWorkspaceMetadataCommand.runOnWorkspace.mock.invocationCallOrder[0];

    expect(beforeSyncCall).toBeLessThan(syncMetadataCall);
    expect(syncMetadataCall).toBeLessThan(afterSyncCall);
    expect(upgradeCommandRunner.migrationReport.success.length).toBe(1);
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
            appVersion: 'v2.0.0',
            workspaceOverride: {
              version: 'v1.0.12',
            },
          },
        },
      },
      {
        title:
          'even if workspace version and app version differ in patch and semantic',
        context: {
          input: {
            appVersion: 'v2.0.0',
            workspaceOverride: {
              version: '1.0.12',
            },
          },
        },
      },
      {
        title: 'even if app version contains a patch value',
        context: {
          input: {
            appVersion: '2.0.24',
            workspaceOverride: {
              version: '1.0.12',
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
        expect(runCoreMigrationsSpy).toHaveBeenCalledTimes(1);
        expect(runAfterSyncMetadataSpy).toHaveBeenCalledTimes(1);
        expect(runBeforeSyncMetadataSpy).toHaveBeenCalledTimes(1);
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
      };
    }>[] = [
      {
        title: 'when workspace version is not equal to fromVersion',
        context: {
          input: {
            appVersion: '2.0.0',
            workspaceOverride: {
              version: '0.1.0',
            },
          },
          output: {
            failReportWorkspaceId: 'workspace_0',
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
          },
        },
      },
      {
        title: 'when previous version is not found',
        context: {
          input: {
            appVersion: '1.0.0',
          },
        },
      },
      {
        title: 'when all commands contains invalid semver keys',
        context: {
          input: {
            commandRunner: InvalidUpgradeCommandRunner,
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
        expect(error).toMatchSnapshot();
      },
    );
  });
});
