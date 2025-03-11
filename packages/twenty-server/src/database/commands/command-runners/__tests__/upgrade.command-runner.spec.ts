import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SemVer } from 'semver';
import { Repository } from 'typeorm';

import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
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

describe('fromVersion validation', () => {
  it('should fail if fromVersion is not a valid semver', () => {
    expect(() => {
      new InvalidVersionUpgradeCommandRunner(
        {} as WorkspaceRepository<Workspace>,
        {} as EnvironmentService,
        {} as TwentyORMGlobalManager,
        {} as SyncWorkspaceMetadataCommand,
      );
    }).toThrowErrorMatchingInlineSnapshot(`"Invalid Version: invalid"`);
  });
});

const genereateMockWorkspace = (overrides?: Partial<Workspace>) =>
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
  let afterSyncMetadataUpgradeCommandsToRun: jest.SpyInstance; //TODO improve typing ?
  let beforeSyncMetadataUpgradeCommandsToRun: jest.SpyInstance; //TODO improve typing ?
  let errors: Error[] = [];

  type BuildModuleAndSetupSpiesArgs = {
    numberOfWorkspace?: number;
    workspaceOverride?: Partial<Workspace>;
    appVersion?: string | null;
    commandRunner?: CommandRunnerValues;
  };
  const buildModuleAndSetupSpies = async ({
    numberOfWorkspace = 1,
    workspaceOverride,
    commandRunner = TestUpgradeCommandRunnerV1,
    appVersion = '2.0.0',
  }: BuildModuleAndSetupSpiesArgs) => {
    const workspaces = Array.from({ length: numberOfWorkspace }, (_v, index) =>
      genereateMockWorkspace({
        id: `workspace_${index}`,
        ...workspaceOverride,
      }),
    );
    const module = await buildUpgradeCommandModule({
      commandRunner,
      appVersion,
      workspaces,
    });

    errors = [];
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
  };

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
      workspaceRepository.update,
    ].forEach((fn) => expect(fn).toHaveBeenCalledTimes(numberOfWorkspace));
    expect(upgradeCommandRunner.migrationReport).toMatchInlineSnapshot();
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
    expect(upgradeCommandRunner.migrationReport).toMatchInlineSnapshot();
  });

  it('should fail if workspace version is not the same as fromVersion', async () => {
    await buildModuleAndSetupSpies({
      numberOfWorkspace: 1,
      appVersion: '3.0.0',
      commandRunner: TestUpgradeCommandRunnerV2,
      workspaceOverride: {
        version: '0.1.0',
      },
    });

    const passedParams = [];
    const options = {};
    await upgradeCommandRunner.run(passedParams, options);
    expect(upgradeCommandRunner.migrationReport).toMatchInlineSnapshot(`
{
  "fail": [
    {
      "error": [Error: WORKSPACE_VERSION_MISSMATCH workspaceVersion=0.1.0 from=2.0.0 to=3.0.0],
      "workspaceId": "workspace_0",
    },
  ],
  "success": [],
}
`);
  });

  it('should fail if upgrade command version is invalid', async () => {
    await expect(
      buildModuleAndSetupSpies({
        commandRunner: InvalidVersionUpgradeCommandRunner,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Invalid Version: invalid"`);
  });

  it('should fail if workspace version is not defined', async () => {
    await buildModuleAndSetupSpies({
      workspaceOverride: {
        version: null,
      },
    });

    const passedParams = [];
    const options = {};
    await upgradeCommandRunner.run(passedParams, options);
    expect(upgradeCommandRunner.migrationReport).toMatchInlineSnapshot();
  });

  it('should fail if app version is not defined', async () => {
    await buildModuleAndSetupSpies({
      appVersion: null,
    });

    const passedParams = [];
    const options = {};
    await expect(
      upgradeCommandRunner.run(passedParams, options),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot run upgrade command when APP_VERSION is not defined "`,
    );
  });
});
