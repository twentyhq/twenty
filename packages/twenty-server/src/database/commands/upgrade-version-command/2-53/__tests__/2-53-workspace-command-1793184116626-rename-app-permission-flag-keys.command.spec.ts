import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type DataSource, type EntityManager } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RenameAppPermissionFlagKeysCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793184116626-rename-app-permission-flag-keys.command';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';

type CommandMenuItemMigrationArgs = {
  allFlatEntityOperationByMetadataName: {
    commandMenuItem: { flatEntityToUpdate: FlatCommandMenuItem[] };
  };
  isSystemBuild: boolean;
  applicationUniversalIdentifier: string;
};

const buildPermissionFlag = (
  universalIdentifier: string,
  key: string,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
): FlatPermissionFlag =>
  ({
    id: `id-${universalIdentifier}`,
    universalIdentifier,
    key,
    applicationUniversalIdentifier,
  }) as FlatPermissionFlag;

const buildCommandMenuItem = (
  universalIdentifier: string,
  conditionalAvailabilityExpression: string,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    conditionalAvailabilityExpression,
    applicationUniversalIdentifier,
  }) as FlatCommandMenuItem;

const buildInitialPermissionFlags = () => [
  buildPermissionFlag(
    'e5f63b2d-5369-5df6-8f32-a8bd9e79e653',
    'CONNECTED_ACCOUNTS',
  ),
  buildPermissionFlag('9faa55f7-2606-566b-9e1d-aefbedbd0136', 'APPLICATIONS'),
  buildPermissionFlag('1c7f09a7-367d-568b-a0e8-c274eccd6ee3', 'AI'),
];

const buildInitialCommandMenuItems = () => [
  buildCommandMenuItem(
    '447a65cc-8535-408e-9c48-db24affb7530',
    'permissionFlags.CONNECTED_ACCOUNTS',
  ),
  buildCommandMenuItem(
    '44db6d7a-79ac-485e-b3da-da8776bd7777',
    'permissionFlags.APPLICATIONS',
  ),
  buildCommandMenuItem(
    'app-owned-command-menu-item',
    'permissionFlags.CONNECTED_ACCOUNTS',
    OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
  ),
];

const indexByUniversalIdentifier = <
  TFlatEntity extends { universalIdentifier: string },
>(
  flatEntities: TFlatEntity[],
) =>
  Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  );

describe('RenameAppPermissionFlagKeysCommand', () => {
  let permissionFlags: FlatPermissionFlag[];
  let commandMenuItems: FlatCommandMenuItem[];
  let transactionCount: number;
  let migrationCalls: CommandMenuItemMigrationArgs[];
  let getOrRecompute: jest.Mock;
  let invalidateAndRecompute: jest.Mock;
  let command: RenameAppPermissionFlagKeysCommand;

  const getKeys = () => permissionFlags.map(({ key }) => key);

  const getExpressions = () =>
    commandMenuItems.map(
      ({ conditionalAvailabilityExpression }) =>
        conditionalAvailabilityExpression,
    );

  beforeEach(() => {
    permissionFlags = buildInitialPermissionFlags();
    commandMenuItems = buildInitialCommandMenuItems();
    transactionCount = 0;
    migrationCalls = [];
    getOrRecompute = jest.fn(async () => ({
      flatPermissionFlagMaps: {
        byUniversalIdentifier: indexByUniversalIdentifier(permissionFlags),
      },
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: indexByUniversalIdentifier(commandMenuItems),
      },
    }));
    invalidateAndRecompute = jest.fn();

    const workspaceCacheService = {
      getOrRecompute,
      invalidateAndRecompute,
    } as unknown as WorkspaceCacheService;

    const entityManager = {
      update: jest.fn(
        async (
          _entity: unknown,
          where: { id: string; workspaceId: string; key: string },
          { key }: { key: string },
        ) => {
          const matchingPermissionFlags = permissionFlags.filter(
            (permissionFlag) =>
              where.workspaceId === WORKSPACE_ID &&
              permissionFlag.id === where.id &&
              permissionFlag.key === where.key,
          );

          permissionFlags = permissionFlags.map((permissionFlag) =>
            matchingPermissionFlags.includes(permissionFlag)
              ? { ...permissionFlag, key }
              : permissionFlag,
          );

          return { affected: matchingPermissionFlags.length };
        },
      ),
    } as unknown as EntityManager;

    const coreDataSource = {
      transaction: jest.fn(
        async (
          runInTransaction: (entityManager: EntityManager) => Promise<void>,
        ) => {
          transactionCount++;

          await runInTransaction(entityManager);
        },
      ),
    } as unknown as DataSource;

    const workspaceMigrationValidateBuildAndRunService = {
      validateBuildAndRunLegacyWorkspaceMigration: jest.fn(
        async (args: CommandMenuItemMigrationArgs) => {
          migrationCalls.push(args);

          const updatedCommandMenuItems = indexByUniversalIdentifier(
            args.allFlatEntityOperationByMetadataName.commandMenuItem
              .flatEntityToUpdate,
          );

          commandMenuItems = commandMenuItems.map(
            (commandMenuItem) =>
              updatedCommandMenuItems[commandMenuItem.universalIdentifier] ??
              commandMenuItem,
          );

          return { status: 'success' };
        },
      ),
    } as unknown as WorkspaceMigrationValidateBuildAndRunService;

    command = new RenameAppPermissionFlagKeysCommand(
      {} as WorkspaceIteratorService,
      workspaceCacheService,
      workspaceMigrationValidateBuildAndRunService,
      coreDataSource,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const buildArgs = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  it('renames the standard keys and the standard command menu expressions that read them', async () => {
    await command.runOnWorkspace(buildArgs());

    expect(getKeys()).toEqual(['USER_APPS', 'WORKSPACE_APPS', 'AI']);
    expect(getExpressions()).toEqual([
      'permissionFlags.USER_APPS',
      'permissionFlags.WORKSPACE_APPS',
      'permissionFlags.CONNECTED_ACCOUNTS',
    ]);
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatPermissionFlagMaps',
    ]);
    expect(migrationCalls).toMatchObject([
      {
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    ]);
  });

  it('changes nothing on a second run', async () => {
    await command.runOnWorkspace(buildArgs());

    transactionCount = 0;
    migrationCalls = [];

    await command.runOnWorkspace(buildArgs());

    expect(transactionCount).toBe(0);
    expect(migrationCalls).toEqual([]);
  });

  it('restores the previous keys and expressions on down', async () => {
    await command.up(buildArgs());
    await command.down(buildArgs());

    expect(permissionFlags).toEqual(buildInitialPermissionFlags());
    expect(getExpressions()).toEqual(
      buildInitialCommandMenuItems().map(
        ({ conditionalAvailabilityExpression }) =>
          conditionalAvailabilityExpression,
      ),
    );
  });

  it('writes nothing on a dry run', async () => {
    await command.runOnWorkspace(buildArgs(true));

    expect(transactionCount).toBe(0);
    expect(migrationCalls).toEqual([]);
    expect(permissionFlags).toEqual(buildInitialPermissionFlags());
  });

  it('fails the workspace without writing anything when another flag already holds a new key', async () => {
    permissionFlags = [
      ...permissionFlags,
      buildPermissionFlag(
        '20202020-4444-4444-8444-444444444444',
        'USER_APPS',
        OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ];

    await expect(command.runOnWorkspace(buildArgs())).rejects.toThrow(
      `CONNECTED_ACCOUNTS cannot become USER_APPS: permission flag 20202020-4444-4444-8444-444444444444 of application ${OTHER_APPLICATION_UNIVERSAL_IDENTIFIER} already uses that key`,
    );
    expect(transactionCount).toBe(0);
    expect(migrationCalls).toEqual([]);
    expect(getKeys()).toEqual([
      'CONNECTED_ACCOUNTS',
      'APPLICATIONS',
      'AI',
      'USER_APPS',
    ]);
  });

  it('fails and refreshes the cache when a key changed after it was cached', async () => {
    const [connectedAccountsPermissionFlag] = permissionFlags;

    getOrRecompute.mockImplementationOnce(async () => {
      const cachedPermissionFlags = [...permissionFlags];

      permissionFlags = permissionFlags.map((permissionFlag) =>
        permissionFlag === connectedAccountsPermissionFlag
          ? { ...permissionFlag, key: 'SOMETHING_ELSE' }
          : permissionFlag,
      );

      return {
        flatPermissionFlagMaps: {
          byUniversalIdentifier: indexByUniversalIdentifier(
            cachedPermissionFlags,
          ),
        },
        flatCommandMenuItemMaps: {
          byUniversalIdentifier: indexByUniversalIdentifier(commandMenuItems),
        },
      };
    });

    await expect(command.runOnWorkspace(buildArgs())).rejects.toThrow(
      `permission flag ${connectedAccountsPermissionFlag.id} no longer has key CONNECTED_ACCOUNTS`,
    );
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatPermissionFlagMaps',
    ]);
    expect(migrationCalls).toEqual([]);
  });
});
