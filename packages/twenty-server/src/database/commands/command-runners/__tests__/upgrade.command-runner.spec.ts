import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SemVer } from 'semver';
import { Repository } from 'typeorm';

import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { EachTestingContext } from 'twenty-shared';
import { UpgradeCommandRunner } from '../upgrade.command-runner';

class TestUpgradeCommandRunnerV1 extends UpgradeCommandRunner {
  fromVersion = new SemVer('1.0.0');

  public override async beforeSyncMetadataUpgradeCommandsToRun(): Promise<void> {
    return;
  }

  public override async afterSyncMetadataUpgradeCommandsToRun(): Promise<void> {
    return;
  }
}

class InvalidVersionUpgradeCommandRunner extends UpgradeCommandRunner {
  fromVersion = new SemVer('invalid');

  protected async beforeSyncMetadataUpgradeCommandsToRun(): Promise<void> {
    return;
  }

  protected async afterSyncMetadataUpgradeCommandsToRun(): Promise<void> {
    return;
  }
}

class TestUpgradeCommandRunnerV2 extends UpgradeCommandRunner {
  fromVersion = new SemVer('2.0.0');

  protected async beforeSyncMetadataUpgradeCommandsToRun(): Promise<void> {
    return;
  }

  protected async afterSyncMetadataUpgradeCommandsToRun(): Promise<void> {
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
  let afterSyncMetadataUpgradeCommandsToRun: jest.SpyInstance;
  let beforeSyncMetadataUpgradeCommandsToRun: jest.SpyInstance;
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
    beforeSyncMetadataUpgradeCommandsToRun = jest.spyOn(
      upgradeCommandRunner,
      'beforeSyncMetadataUpgradeCommandsToRun',
    );
    afterSyncMetadataUpgradeCommandsToRun = jest.spyOn(
      upgradeCommandRunner,
      'afterSyncMetadataUpgradeCommandsToRun',
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

  it('should run upgrade command with failing and successfull workspaces', async () => {
    const outdatedVersionWorkspaces = generateMockWorkspace({
      id: 'outated_version_workspace',
      version: '0.42.42',
    });
    const invalidVesionWorkspace = generateMockWorkspace({
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
      invalidVesionWorkspace,
      nullVersionWorkspace,
    ];
    const totalWorkspace = numberOfValidWorkspace + failingWorkspaces.length;
    await buildModuleAndSetupSpies({
      numberOfWorkspace: numberOfValidWorkspace,
      workspaces: failingWorkspaces,
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
      upgradeCommandRunner.beforeSyncMetadataUpgradeCommandsToRun,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      upgradeCommandRunner.afterSyncMetadataUpgradeCommandsToRun,
      workspaceRepository.update,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(numberOfValidWorkspace));
    expect(successReport.length).toBe(numberOfValidWorkspace);

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
    await buildModuleAndSetupSpies({
      numberOfWorkspace,
    });
    const passedParams = [];
    const options = {};
    await upgradeCommandRunner.run(passedParams, options);

    [
      upgradeCommandRunner.runOnWorkspace,
      upgradeCommandRunner.beforeSyncMetadataUpgradeCommandsToRun,
      upgradeCommandRunner.afterSyncMetadataUpgradeCommandsToRun,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      twentyORMGlobalManagerSpy.destroyDataSourceForWorkspace,
      workspaceRepository.update,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(numberOfWorkspace));
    expect(upgradeCommandRunner.migrationReport.success.length).toBe(42);
    expect(upgradeCommandRunner.migrationReport.fail.length).toBe(0);
  });

  it('should run syncMetadataCommand betwen beforeSyncMetadataUpgradeCommandsToRun and afterSyncMetadataUpgradeCommandsToRun', async () => {
    await buildModuleAndSetupSpies({});
    const passedParams = [];
    const options = {};
    await upgradeCommandRunner.run(passedParams, options);

    [
      upgradeCommandRunner.runOnWorkspace,
      upgradeCommandRunner.beforeSyncMetadataUpgradeCommandsToRun,
      upgradeCommandRunner.afterSyncMetadataUpgradeCommandsToRun,
      syncWorkspaceMetadataCommand.runOnWorkspace,
      twentyORMGlobalManagerSpy.destroyDataSourceForWorkspace,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(1));

    // Verify order of execution
    const beforeSyncCall =
      beforeSyncMetadataUpgradeCommandsToRun.mock.invocationCallOrder[0];
    const afterSyncCall =
      afterSyncMetadataUpgradeCommandsToRun.mock.invocationCallOrder[0];
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
