import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SemVer } from 'semver';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { SingleVersionUpgradeCommand } from 'src/database/commands/upgrade-version-command/single-version-upgrade.command';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import * as versionUtils from 'src/database/commands/upgrade-version-command/version-utils';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

jest.mock('src/database/commands/upgrade-version-command/version-utils', () => {
  const originalModule = jest.requireActual(
    'src/database/commands/upgrade-version-command/version-utils',
  );

  return {
    ...originalModule,
    discoverVersionPaths: jest.fn().mockReturnValue([
      { baseVersion: '0.43.0', targetVersion: '0.44.0' },
      { baseVersion: '0.44.0', targetVersion: '0.50.0' },
      { baseVersion: '0.50.0', targetVersion: '0.51.0' },
      { baseVersion: '0.51.0', targetVersion: '0.52.0' },
    ]),
  };
});

// Standard mock paths for reference in tests
const mockVersionPaths = [
  { baseVersion: '0.43.0', targetVersion: '0.44.0' },
  { baseVersion: '0.44.0', targetVersion: '0.50.0' },
  { baseVersion: '0.50.0', targetVersion: '0.51.0' },
  { baseVersion: '0.51.0', targetVersion: '0.52.0' },
];

describe('UpgradeCommand', () => {
  let upgradeCommand: UpgradeCommand;
  let mockSingleVersionUpgradeCommand: {
    runOnWorkspace: jest.Mock;
    selectCommandsForVersion: jest.Mock;
    fromWorkspaceVersion: SemVer;
  };

  const workspaceId = 'test-workspace-id';

  const createTestingModule = async (
    workspaces: Partial<Workspace>[] = [],
    appVersion: string | null = '0.52.0',
  ) => {
    mockSingleVersionUpgradeCommand = {
      runOnWorkspace: jest.fn(),
      selectCommandsForVersion: jest.fn().mockReturnValue(true),
      fromWorkspaceVersion: new SemVer('0.51.0'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpgradeCommand,
        {
          provide: SingleVersionUpgradeCommand,
          useValue: mockSingleVersionUpgradeCommand,
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOneByOrFail: jest
              .fn()
              .mockImplementation((args) =>
                workspaces.find((workspace) => workspace.id === args.id),
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
                  return undefined;
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

    upgradeCommand = module.get(UpgradeCommand);

    return module;
  };

  const generateWorkspace = (version: string | null): Partial<Workspace> =>
    ({
      id: workspaceId,
      version: version ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      allowImpersonation: false,
      isPublicInviteLinkEnabled: false,
      displayName: 'Test Workspace',
      domainName: 'test',
      inviteHash: 'hash',
      logo: undefined,
      deletedAt: undefined,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      workspaceMembersCount: 1,
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(versionUtils, 'discoverVersionPaths')
      .mockReturnValue(mockVersionPaths);
  });

  it('should initialize and register version paths', async () => {
    await createTestingModule();

    // Call onModuleInit manually since it's not automatically called in tests
    await upgradeCommand.onModuleInit();

    // Verify the versionPaths are initialized correctly
    const versionPaths = upgradeCommand.versionPathsForTesting;

    expect(versionPaths).toBeDefined();
    expect(versionPaths.length).toBeGreaterThan(0);

    // Verify at least one path exists
    expect(versionPaths[0]).toHaveProperty('baseVersion');
    expect(versionPaths[0]).toHaveProperty('targetVersion');
  });

  it('should reject workspaces with version below minimum supported version', async () => {
    const workspace = generateWorkspace('0.42.0');

    await createTestingModule([workspace]);
    await upgradeCommand.onModuleInit();

    const mockArgs: RunOnWorkspaceArgs = {
      workspaceId,
      dataSource: {} as any,
      index: 0,
      total: 1,
      options: {
        workspaceIds: [workspaceId],
      },
    };

    await expect(upgradeCommand.runOnWorkspace(mockArgs)).rejects.toThrow(
      /WORKSPACE_VERSION_TOO_OLD/,
    );
  });

  it('should skip upgrade for workspaces already at target version', async () => {
    const workspace = generateWorkspace('0.52.0');

    await createTestingModule([workspace]);
    await upgradeCommand.onModuleInit();

    const mockArgs: RunOnWorkspaceArgs = {
      workspaceId,
      dataSource: {} as any,
      index: 0,
      total: 1,
      options: {
        workspaceIds: [workspaceId],
      },
    };

    await upgradeCommand.runOnWorkspace(mockArgs);

    // Check upgrade wasn't called
    expect(
      mockSingleVersionUpgradeCommand.runOnWorkspace,
    ).not.toHaveBeenCalled();
  });

  it('should apply upgrades in version sequence', async () => {
    const workspace = generateWorkspace('0.43.0');

    const module = await createTestingModule([workspace]);

    await upgradeCommand.onModuleInit();

    const mockArgs: RunOnWorkspaceArgs = {
      workspaceId,
      dataSource: {} as any,
      index: 0,
      total: 1,
      options: {
        workspaceIds: [workspaceId],
      },
    };

    // Get the repository to verify calls later
    const repository = module.get(getRepositoryToken(Workspace, 'core'));

    await upgradeCommand.runOnWorkspace(mockArgs);

    // Verify upgradeCommand.runOnWorkspace was called
    expect(
      mockSingleVersionUpgradeCommand.runOnWorkspace,
    ).toHaveBeenCalledTimes(4);

    // Verify workspaceRepository.update was called with the correct versions
    expect(repository.update).toHaveBeenCalledTimes(4);
    expect(repository.update).toHaveBeenNthCalledWith(
      1,
      { id: workspaceId },
      { version: '0.44.0' },
    );
    expect(repository.update).toHaveBeenNthCalledWith(
      2,
      { id: workspaceId },
      { version: '0.50.0' },
    );
    expect(repository.update).toHaveBeenNthCalledWith(
      3,
      { id: workspaceId },
      { version: '0.51.0' },
    );
    expect(repository.update).toHaveBeenNthCalledWith(
      4,
      { id: workspaceId },
      { version: '0.52.0' },
    );
  });

  it('should validate upgrade path is complete', async () => {
    await createTestingModule();
    await upgradeCommand.onModuleInit();

    expect(upgradeCommand.validateUpgradePath('0.43.0', '0.51.0')).toBe(true);

    // Mock an empty path for invalid case
    jest.spyOn(versionUtils, 'discoverVersionPaths').mockReturnValue([]);
    await upgradeCommand.onModuleInit();

    expect(upgradeCommand.validateUpgradePath('0.43.0', '0.51.0')).toBe(false);
  });

  it('should handle null/undefined workspace version', async () => {
    const workspace = generateWorkspace(null);

    await createTestingModule([workspace]);
    await upgradeCommand.onModuleInit();

    const mockArgs: RunOnWorkspaceArgs = {
      workspaceId,
      dataSource: {} as any,
      index: 0,
      total: 1,
      options: {
        workspaceIds: [workspaceId],
      },
    };

    await expect(upgradeCommand.runOnWorkspace(mockArgs)).rejects.toThrow(
      /WORKSPACE_VERSION_NOT_DEFINED/,
    );
  });

  it('should handle missing APP_VERSION', async () => {
    const workspace = generateWorkspace('0.43.0');

    await createTestingModule([workspace], null);
    await upgradeCommand.onModuleInit();

    const mockArgs: RunOnWorkspaceArgs = {
      workspaceId,
      dataSource: {} as any,
      index: 0,
      total: 1,
      options: {
        workspaceIds: [workspaceId],
      },
    };

    await expect(upgradeCommand.runOnWorkspace(mockArgs)).rejects.toThrow(
      /APP_VERSION is not defined/,
    );
  });
});
