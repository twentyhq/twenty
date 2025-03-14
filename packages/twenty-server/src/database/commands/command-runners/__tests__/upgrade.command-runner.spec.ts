import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SemVer } from 'semver';
import { EachTestingContext } from 'twenty-shared';
import { Repository } from 'typeorm';

import { UpgradeCommandRunner } from 'src/database/commands/command-runners/upgrade.command-runner';
import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

class TestUpgradeCommandRunnerV1 extends UpgradeCommandRunner {
  fromWorkspaceVersion = new SemVer('1.0.0');
  VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG = true as const;

  public override async runBeforeSyncMetadata(): Promise<void> {
    return;
  }

  public override async runAfterSyncMetadata(): Promise<void> {
    return;
  }
}

class InvalidVersionUpgradeCommandRunner extends UpgradeCommandRunner {
  fromWorkspaceVersion = new SemVer('invalid');
  VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG = true as const;

  protected async runBeforeSyncMetadata(): Promise<void> {
    return;
  }

  protected async runAfterSyncMetadata(): Promise<void> {
    return;
  }
}

class TestUpgradeCommandRunnerV2 extends UpgradeCommandRunner {
  fromWorkspaceVersion = new SemVer('2.0.0');
  VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG = true as const;

  protected async runBeforeSyncMetadata(): Promise<void> {
    return;
  }

  protected async runAfterSyncMetadata(): Promise<void> {
    return;
  }
}

type CommandRunnerValues =
  | typeof TestUpgradeCommandRunnerV1
  | typeof TestUpgradeCommandRunnerV2
  | typeof InvalidVersionUpgradeCommandRunner;

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
        provide: getRepositoryToken(Workspace, 'core'),
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
        provide: EnvironmentService,
        useValue: {
          get: jest
            .fn()
            .mockImplementation((key: keyof EnvironmentVariables) => {
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
  let upgradeCommandRunner: TestUpgradeCommandRunnerV1;
  let workspaceRepository: Repository<Workspace>;
  let syncWorkspaceMetadataCommand: jest.Mocked<SyncWorkspaceMetadataCommand>;
  let runAfterSyncMetadataSpy: jest.SpyInstance;
  let runBeforeSyncMetadataSpy: jest.SpyInstance;
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
    commandRunner = TestUpgradeCommandRunnerV1,
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

    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
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
    const passedParams = [];
    const options = {};

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

  it('should run upgrade command with failing and successful workspaces', async () => {
    const outdatedVersionWorkspaces = generateMockWorkspace({
      id: 'outated_version_workspace',
      version: '0.42.42',
    });
    const invalidVersionWorkspace = generateMockWorkspace({
      id: 'invalid_version_workspace',
      version: 'invalid',
    });
    const nullVersionWorkspace = generateMockWorkspace({
      id: 'null_version_workspace',
      version: null,
    });
    const numberOfValidWorkspace = 4;
    const failingWorkspaces = [
      outdatedVersionWorkspaces,
      invalidVersionWorkspace,
      nullVersionWorkspace,
    ];
    const totalWorkspace = numberOfValidWorkspace + failingWorkspaces.length;
    const appVersion = 'v2.0.0';
    const expectedToVersion = '2.0.0';

    await buildModuleAndSetupSpies({
      numberOfWorkspace: numberOfValidWorkspace,
      workspaces: failingWorkspaces,
      appVersion,
    });
    const passedParams = [];
    const options = {};

    await upgradeCommandRunner.run(passedParams, options);

    // Common assertions
    const { fail: failReport, success: successReport } =
      upgradeCommandRunner.migrationReport;

    [
      twentyORMGlobalManagerSpy.destroyDataSourceForWorkspace,
      upgradeCommandRunner.runOnWorkspace,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(totalWorkspace));
    expect(failReport.length + successReport.length).toBe(totalWorkspace);

    // Success assertions
    [
      upgradeCommandRunner.runBeforeSyncMetadata,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      upgradeCommandRunner.runAfterSyncMetadata,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(numberOfValidWorkspace));
    expect(successReport.length).toBe(numberOfValidWorkspace);
    expect(workspaceRepository.update).toHaveBeenNthCalledWith(
      numberOfValidWorkspace,
      { id: expect.any(String) },
      { version: expectedToVersion },
    );

    // Failing assertions
    expect(failReport.length).toBe(failingWorkspaces.length);
    failReport.forEach((report) => {
      expect(
        failingWorkspaces.some(
          (workspace) => workspace.id === report.workspaceId,
        ),
      ).toBe(true);
      expect(report.error).toMatchSnapshot();
    });
  });

  it('should run upgrade over several workspaces', async () => {
    const numberOfWorkspace = 42;
    const appVersion = '2.0.0';

    await buildModuleAndSetupSpies({
      numberOfWorkspace,
      appVersion,
    });
    const passedParams = [];
    const options = {};

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
    const passedParams = [];
    const options = {};

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

  describe('Workspace upgrade should fail', () => {
    const failingTestUseCases: EachTestingContext<{
      input: Omit<BuildModuleAndSetupSpiesArgs, 'numberOfWorkspace'>;
    }>[] = [
      {
        title: 'when workspace version is not equal to fromVersion',
        context: {
          input: {
            appVersion: '3.0.0',
            commandRunner: TestUpgradeCommandRunnerV2,
            workspaceOverride: {
              version: '0.1.0',
            },
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
        },
      },
      {
        title: 'when APP_VERSION is not defined',
        context: {
          input: {
            appVersion: null,
          },
        },
      },
    ];

    it.each(failingTestUseCases)('$title', async ({ context: { input } }) => {
      await buildModuleAndSetupSpies(input);

      const passedParams = [];
      const options = {};

      await upgradeCommandRunner.run(passedParams, options);

      const { fail: failReport, success: successReport } =
        upgradeCommandRunner.migrationReport;

      expect(successReport.length).toBe(0);
      expect(failReport.length).toBe(1);
      const { workspaceId, error } = failReport[0];

      expect(workspaceId).toBe('workspace_0');
      expect(error).toMatchSnapshot();
    });
  });

  it('should throw if upgrade command version is invalid', async () => {
    await expect(
      buildModuleAndSetupSpies({
        commandRunner: InvalidVersionUpgradeCommandRunner,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Invalid Version: invalid"`);
  });
});
