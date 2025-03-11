import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SemVer } from 'semver';
import { Repository } from 'typeorm';

import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { UpgradeCommandRunner } from '../upgrade.command-runner';

class TestUpgradeCommandRunner extends UpgradeCommandRunner {
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

describe('UpgradeCommandRunner', () => {
  let upgradeCommandRunner: TestUpgradeCommandRunner;
  let workspaceRepository: Repository<Workspace>;
  let syncWorkspaceMetadataCommand: jest.Mocked<SyncWorkspaceMetadataCommand>;
  let errors: Error[] = [];

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

  const findByOneMockWorkspace = genereateMockWorkspace();
  const ALL_MOCKED_WORKSPACE: Workspace[] = Array.from(
    { length: 42 },
    (_v, index) => genereateMockWorkspace({ id: `workspace_${index}` }),
  ).concat([findByOneMockWorkspace]);
  const NUMBER_OF_MOCK_WORKSPACE = ALL_MOCKED_WORKSPACE.length;
  const mockDataSource = {
    // Add minimal required DataSource implementation
  } as unknown as WorkspaceDataSource; // TODO ?

  beforeEach(async () => {
    errors = [];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestUpgradeCommandRunner,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOneByOrFail: jest.fn().mockImplementation((args) => {
              console.log({ args });
              return findByOneMockWorkspace;
            }),
            update: jest.fn(),
            find: jest.fn().mockResolvedValue(ALL_MOCKED_WORKSPACE),
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
                    return '1.0.0';
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

    upgradeCommandRunner = module.get<TestUpgradeCommandRunner>(
      TestUpgradeCommandRunner,
    );
    jest.spyOn(upgradeCommandRunner, 'beforeSyncMetadataUpgradeCommandsToRun');
    jest.spyOn(upgradeCommandRunner, 'afterSyncMetadataUpgradeCommandsToRun');
    jest.spyOn(upgradeCommandRunner, 'runOnWorkspace');

    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    syncWorkspaceMetadataCommand = module.get(SyncWorkspaceMetadataCommand);
  });

  describe('runOnWorkspace', () => {
    const runArgs = {
      appVersion: '1.1.0',
      workspaceId: 'workspace-id',
      index: 0,
      total: 1,
      options: {
        dryRun: false,
        workspaceIds: ['workspace-id'],
      },
      dataSource: mockDataSource,
    };

    it('should run sync metadata between commands', async () => {
      const beforeSyncSpy = jest.spyOn(
        upgradeCommandRunner,
        'beforeSyncMetadataUpgradeCommandsToRun', // why
      );
      const afterSyncSpy = jest.spyOn(
        upgradeCommandRunner,
        'afterSyncMetadataUpgradeCommandsToRun', // why
      );

      await upgradeCommandRunner.runOnWorkspace(runArgs);

      expect(beforeSyncSpy).toHaveBeenCalled();
      expect(syncWorkspaceMetadataCommand.runOnWorkspace).toHaveBeenCalledWith(
        runArgs,
      );
      expect(afterSyncSpy).toHaveBeenCalled();

      // Verify order of execution
      const beforeSyncCall = beforeSyncSpy.mock.invocationCallOrder[0];
      const syncMetadataCall =
        syncWorkspaceMetadataCommand.runOnWorkspace.mock.invocationCallOrder[0];
      const afterSyncCall = afterSyncSpy.mock.invocationCallOrder[0];

      expect(beforeSyncCall).toBeLessThan(syncMetadataCall);
      expect(syncMetadataCall).toBeLessThan(afterSyncCall);
    });

    it('should fail if workspace version is not the same as fromVersion', async () => {
      const workspaceWithDifferentVersion = {
        ...findByOneMockWorkspace,
        version: '0.9.0',
      };

      jest
        .spyOn(workspaceRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(workspaceWithDifferentVersion);

      await expect(
        upgradeCommandRunner.runOnWorkspace(runArgs),
      ).rejects.toThrow(
        'WORKSPACE_VERSION_MISSMATCH workspaceVersion=0.9.0 from=1.0.0 to=1.1.0',
      );
    });

    it('should fail if workspace version is not defined', async () => {
      const workspaceWithoutVersion = {
        ...findByOneMockWorkspace,
        version: undefined,
      };

      jest
        .spyOn(workspaceRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(workspaceWithoutVersion);

      await expect(
        upgradeCommandRunner.runOnWorkspace(runArgs),
      ).rejects.toThrow('WORKSPACE_VERSION_NOT_DEFINED to=1.1.0');
    });

    it('should fail if app version is not defined', async () => {
      await expect(
        upgradeCommandRunner.runOnWorkspace({
          ...runArgs,
          appVersion: undefined,
        }),
      ).rejects.toThrow('Should never occur, APP_VERSION_NOT_DEFINED');
    });

    it('should update workspace version after successful upgrade', async () => {
      const passedParams = [];
      const options = {};
      await upgradeCommandRunner.run(passedParams, options);

      [
        upgradeCommandRunner.runOnWorkspace,
        upgradeCommandRunner.beforeSyncMetadataUpgradeCommandsToRun,
        upgradeCommandRunner.afterSyncMetadataUpgradeCommandsToRun,
        syncWorkspaceMetadataCommand.runOnWorkspace,
      ].forEach((fn) =>
        expect(fn).toHaveBeenCalledTimes(NUMBER_OF_MOCK_WORKSPACE),
      );

      expect(workspaceRepository.update).toHaveBeenCalledTimes(
        NUMBER_OF_MOCK_WORKSPACE,
      );
    });
  });

  describe('error aggregation', () => {
    it('should collect all errors during the upgrade process', async () => {
      const workspaces = ['workspace-1', 'workspace-2', 'workspace-3'];

      // Mock different error scenarios
      jest
        .spyOn(workspaceRepository, 'findOneByOrFail')
        .mockImplementation(async ({ id }) => {
          if (id === 'workspace-1') {
            return { ...findByOneMockWorkspace, version: '0.9.0' };
          }
          if (id === 'workspace-2') {
            return { ...findByOneMockWorkspace, version: undefined };
          }
          return findByOneMockWorkspace;
        });

      for (const workspaceId of workspaces) {
        try {
          await upgradeCommandRunner.runOnWorkspace({
            ...runArgs,
            workspaceId,
          });
        } catch (error) {
          errors.push(error as Error);
        }
      }

      expect(errors).toHaveLength(2);
      expect(errors[0].message).toContain('WORKSPACE_VERSION_MISSMATCH');
      expect(errors[1].message).toContain('WORKSPACE_VERSION_NOT_DEFINED');
    });
  });
});
