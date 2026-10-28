import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RenameAppPermissionFlagKeysCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793197606583-rename-app-permission-flag-keys.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const CREATED_AT = '2026-01-01T00:00:00.000Z';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-5555-4555-8555-555555555555';

const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';

type CommandMenuItemMigrationArgs = {
  allFlatEntityOperationByMetadataName: {
    commandMenuItem: { flatEntityToUpdate: FlatCommandMenuItem[] };
  };
  applicationUniversalIdentifier: string;
};

const OTHER_APPLICATION_ID = '20202020-3333-4333-8333-000000000003';

const buildPermissionFlag = ({
  universalIdentifier,
  key,
  applicationId = 'standard-application-id',
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: Pick<FlatPermissionFlag, 'universalIdentifier' | 'key'> &
  Partial<
    Pick<FlatPermissionFlag, 'applicationId' | 'applicationUniversalIdentifier'>
  >): FlatPermissionFlag => ({
  id: `id-${universalIdentifier}`,
  universalIdentifier,
  key,
  applicationId,
  applicationUniversalIdentifier,
  workspaceId: WORKSPACE_ID,
  label: key,
  description: null,
  icon: null,
  permissionType: 'settings',
  rolePermissionFlagIds: [],
  rolePermissionFlagUniversalIdentifiers: [],
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
});

const buildCommandMenuItem = (
  overrides: Pick<
    FlatCommandMenuItem,
    | 'id'
    | 'universalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'conditionalAvailabilityExpression'
    | 'conditionalPinnedExpression'
  >,
): FlatCommandMenuItem => ({
  workspaceId: WORKSPACE_ID,
  applicationId: `application-id-${overrides.applicationUniversalIdentifier}`,
  label: 'Command menu item',
  shortLabel: null,
  icon: null,
  position: 0,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  availabilityObjectMetadataId: null,
  availabilityObjectMetadataUniversalIdentifier: null,
  navigationTargetObjectMetadataId: null,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  frontComponentId: null,
  frontComponentUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  workflowVersionId: null,
  coreWorkflowVersionId: null,
  hotKeys: null,
  payload: null,
  overrides: null,
  universalOverrides: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

const buildInitialPermissionFlags = () => [
  buildPermissionFlag({
    universalIdentifier: 'e5f63b2d-5369-5df6-8f32-a8bd9e79e653',
    key: 'CONNECTED_ACCOUNTS',
  }),
  buildPermissionFlag({
    universalIdentifier: '9faa55f7-2606-566b-9e1d-aefbedbd0136',
    key: 'APPLICATIONS',
  }),
  buildPermissionFlag({
    universalIdentifier: '1c7f09a7-367d-568b-a0e8-c274eccd6ee3',
    key: 'AI',
  }),
];

const buildRenamedPermissionFlags = () => [
  buildPermissionFlag({
    universalIdentifier: 'e5f63b2d-5369-5df6-8f32-a8bd9e79e653',
    key: 'USER_APPS',
  }),
  buildPermissionFlag({
    universalIdentifier: '9faa55f7-2606-566b-9e1d-aefbedbd0136',
    key: 'WORKSPACE_APPS',
  }),
  buildPermissionFlag({
    universalIdentifier: '1c7f09a7-367d-568b-a0e8-c274eccd6ee3',
    key: 'AI',
  }),
];

const buildCollidingPermissionFlag = () =>
  buildPermissionFlag({
    universalIdentifier: '20202020-4444-4444-8444-444444444444',
    key: 'USER_APPS',
    applicationId: OTHER_APPLICATION_ID,
    applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

const buildInitialCommandMenuItems = () => [
  buildCommandMenuItem({
    id: 'standard-command-menu-item-id',
    universalIdentifier: '447a65cc-8535-408e-9c48-db24affb7530',
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
    conditionalPinnedExpression: null,
  }),
  buildCommandMenuItem({
    id: 'custom-command-menu-item-id',
    universalIdentifier: 'custom-command-menu-item',
    applicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    conditionalAvailabilityExpression: null,
    conditionalPinnedExpression: 'permissionFlags.APPLICATIONS',
  }),
  buildCommandMenuItem({
    id: 'other-application-command-menu-item-id',
    universalIdentifier: 'other-application-command-menu-item',
    applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
    conditionalPinnedExpression: null,
  }),
];

const buildFailedMigrationResult = (code: string) => ({
  status: 'fail',
  report: { commandMenuItem: [{ errors: [{ code, message: code }] }] },
});

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
  let writes: string[];
  let getOrRecompute: jest.Mock;
  let invalidateAndRecompute: jest.Mock;
  let findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigration: jest.Mock;
  let validateBuildAndRunWorkspaceMigration: jest.Mock;
  let command: RenameAppPermissionFlagKeysCommand;
  let log: jest.SpyInstance;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;

  const getKeys = () => permissionFlags.map(({ key }) => key);

  const getExpressions = () =>
    commandMenuItems.map(
      ({ conditionalAvailabilityExpression, conditionalPinnedExpression }) =>
        conditionalAvailabilityExpression ?? conditionalPinnedExpression,
    );

  const applyCommandMenuItemMigration = (
    path: string,
    args: CommandMenuItemMigrationArgs,
  ) => {
    writes.push(`${path} ${args.applicationUniversalIdentifier}`);

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
  };

  beforeEach(async () => {
    permissionFlags = buildInitialPermissionFlags();
    commandMenuItems = buildInitialCommandMenuItems();
    writes = [];
    getOrRecompute = jest.fn(async () => ({
      flatPermissionFlagMaps: {
        byUniversalIdentifier: indexByUniversalIdentifier(permissionFlags),
      },
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: indexByUniversalIdentifier(commandMenuItems),
      },
      flatApplicationMaps: {
        byId: { [OTHER_APPLICATION_ID]: { name: 'Invoice Exporter' } },
      },
    }));
    invalidateAndRecompute = jest.fn(async () => {
      writes.push('permission flag cache');
    });

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
    };

    const coreDataSource = {
      transaction: jest.fn(
        async (
          runInTransaction: (
            transactionEntityManager: typeof entityManager,
          ) => Promise<void>,
        ) => {
          await runInTransaction(entityManager);

          writes.push('permission flag keys');
        },
      ),
    };

    findWorkspaceTwentyStandardAndCustomApplicationOrThrow = jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          universalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      });
    validateBuildAndRunLegacyWorkspaceMigration = jest.fn(
      async (args: CommandMenuItemMigrationArgs) =>
        applyCommandMenuItemMigration('legacy', args),
    );
    validateBuildAndRunWorkspaceMigration = jest.fn(
      async (args: CommandMenuItemMigrationArgs) =>
        applyCommandMenuItemMigration('side-effect', args),
    );

    const applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow,
    } satisfies Pick<
      ApplicationService,
      'findWorkspaceTwentyStandardAndCustomApplicationOrThrow'
    >;
    const workspaceCacheService = {
      getOrRecompute,
      invalidateAndRecompute,
    } satisfies Pick<
      WorkspaceCacheService,
      'getOrRecompute' | 'invalidateAndRecompute'
    >;
    const workspaceMigrationValidateBuildAndRunService = {
      validateBuildAndRunLegacyWorkspaceMigration,
      validateBuildAndRunWorkspaceMigration,
    } satisfies Pick<
      WorkspaceMigrationValidateBuildAndRunService,
      | 'validateBuildAndRunLegacyWorkspaceMigration'
      | 'validateBuildAndRunWorkspaceMigration'
    >;

    const module = await Test.createTestingModule({
      providers: [
        RenameAppPermissionFlagKeysCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        { provide: ApplicationService, useValue: applicationService },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: workspaceMigrationValidateBuildAndRunService,
        },
        { provide: getDataSourceToken(), useValue: coreDataSource },
      ],
    }).compile();

    command = module.get(RenameAppPermissionFlagKeysCommand);

    log = jest.spyOn(command['logger'], 'log').mockImplementation();
    warn = jest.spyOn(command['logger'], 'warn').mockImplementation();
    error = jest.spyOn(command['logger'], 'error').mockImplementation();
  });

  const buildArgs = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  const changeConnectedAccountsKeyAfterCaching = () => {
    getOrRecompute.mockImplementationOnce(async () => {
      const cachedPermissionFlags = [...permissionFlags];

      permissionFlags = permissionFlags.map((permissionFlag) =>
        permissionFlag.key === 'CONNECTED_ACCOUNTS'
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
  };

  it('renames the keys, then the standard command menu items on the legacy path, then the custom ones on the side-effect path', async () => {
    await command.runOnWorkspace(buildArgs());

    expect(writes).toEqual([
      'permission flag keys',
      'permission flag cache',
      `legacy ${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}`,
      `side-effect ${WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER}`,
    ]);
    expect(getKeys()).toEqual(['USER_APPS', 'WORKSPACE_APPS', 'AI']);
    expect(getExpressions()).toEqual([
      'permissionFlags.USER_APPS',
      'permissionFlags.WORKSPACE_APPS',
      'permissionFlags.CONNECTED_ACCOUNTS',
    ]);
    expect(warn).toHaveBeenCalledWith(
      `Workspace ${WORKSPACE_ID}: leaving 1 command menu item(s) of other applications that read a renamed permission flag key: other-application-command-menu-item-id (application ${OTHER_APPLICATION_UNIVERSAL_IDENTIFIER})`,
    );
  });

  it('restores the previous keys and expressions on down', async () => {
    await command.up(buildArgs());
    await command.down(buildArgs());

    expect(permissionFlags).toEqual(buildInitialPermissionFlags());
    expect(commandMenuItems).toEqual(
      buildInitialCommandMenuItems().map((commandMenuItem) => ({
        ...commandMenuItem,
        updatedAt: expect.any(String),
      })),
    );
  });

  it('writes nothing once the workspace is renamed', async () => {
    await command.runOnWorkspace(buildArgs());

    writes = [];

    await command.runOnWorkspace(buildArgs());

    expect(writes).toEqual([]);
  });

  it('writes nothing on a dry run', async () => {
    await command.runOnWorkspace(buildArgs(true));

    expect(writes).toEqual([]);
    expect(permissionFlags).toEqual(buildInitialPermissionFlags());
    expect(commandMenuItems).toEqual(buildInitialCommandMenuItems());
    expect(log).toHaveBeenCalledWith(
      `[DRY RUN] Workspace ${WORKSPACE_ID}: renaming permission flag key(s) CONNECTED_ACCOUNTS -> USER_APPS, APPLICATIONS -> WORKSPACE_APPS and the permission flag references of 2 command menu item(s) (1 standard, 1 custom)`,
    );
  });

  it('leaves the key list out of the log when only expressions change', async () => {
    permissionFlags = buildRenamedPermissionFlags();

    await command.runOnWorkspace(buildArgs());

    expect(log).toHaveBeenCalledWith(
      `Workspace ${WORKSPACE_ID}: renaming the permission flag references of 2 command menu item(s) (1 standard, 1 custom)`,
    );
    expect(writes).toEqual([
      `legacy ${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}`,
      `side-effect ${WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER}`,
    ]);
  });

  it('aborts before any write when another flag already holds a new key', async () => {
    permissionFlags = [...permissionFlags, buildCollidingPermissionFlag()];

    await expect(command.runOnWorkspace(buildArgs())).rejects.toThrow(
      `CONNECTED_ACCOUNTS cannot become USER_APPS: permission flag 20202020-4444-4444-8444-444444444444 of application "Invoice Exporter" (${OTHER_APPLICATION_UNIVERSAL_IDENTIFIER}) already uses that key. Permission flag keys cannot change: revoke each conflicting permission flag from every role, uninstall its application, then rerun the upgrade. Afterwards, grant the standard Workspace Apps or User Apps permission again where it was removed. upgrade --dry-run lists the workspaces that still collide.`,
    );
    expect(writes).toEqual([]);
  });

  it('reports the collision on a dry run too', async () => {
    permissionFlags = [...permissionFlags, buildCollidingPermissionFlag()];

    await expect(command.runOnWorkspace(buildArgs(true))).rejects.toThrow(
      'CONNECTED_ACCOUNTS cannot become USER_APPS',
    );
  });

  it('leaves an invalid custom command menu item behind with a warning instead of failing', async () => {
    validateBuildAndRunWorkspaceMigration.mockResolvedValueOnce(
      buildFailedMigrationResult('WORKFLOW_OR_FRONT_COMPONENT_REQUIRED'),
    );

    await command.runOnWorkspace(buildArgs());

    expect(getKeys()).toEqual(['USER_APPS', 'WORKSPACE_APPS', 'AI']);
    expect(getExpressions()).toEqual([
      'permissionFlags.USER_APPS',
      'permissionFlags.APPLICATIONS',
      'permissionFlags.CONNECTED_ACCOUNTS',
    ]);
    expect(warn).toHaveBeenCalledWith(
      `Workspace ${WORKSPACE_ID}: left the permission flag references of 1 custom command menu item(s) unchanged because they fail validation: custom-command-menu-item-id (WORKFLOW_OR_FRONT_COMPONENT_REQUIRED). They keep the old keys and stop matching once the old keys are no longer reported`,
    );
  });

  it('still rewrites the next custom command menu item after one fails validation', async () => {
    commandMenuItems = [
      ...buildInitialCommandMenuItems(),
      buildCommandMenuItem({
        id: 'second-custom-command-menu-item-id',
        universalIdentifier: 'second-custom-command-menu-item',
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
        conditionalPinnedExpression: null,
      }),
    ];
    validateBuildAndRunWorkspaceMigration.mockResolvedValueOnce(
      buildFailedMigrationResult('WORKFLOW_OR_FRONT_COMPONENT_REQUIRED'),
    );

    await command.runOnWorkspace(buildArgs());

    expect(getExpressions()).toEqual([
      'permissionFlags.USER_APPS',
      'permissionFlags.APPLICATIONS',
      'permissionFlags.CONNECTED_ACCOUNTS',
      'permissionFlags.USER_APPS',
    ]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'fail validation: custom-command-menu-item-id (WORKFLOW_OR_FRONT_COMPONENT_REQUIRED).',
      ),
    );
  });

  it('fails when the standard command menu items fail validation', async () => {
    validateBuildAndRunLegacyWorkspaceMigration.mockResolvedValueOnce({
      status: 'fail',
      report: {},
    });

    await expect(command.runOnWorkspace(buildArgs())).rejects.toThrow(
      `Failed to rename the app permission flag references in the standard command menu items of workspace ${WORKSPACE_ID}`,
    );
  });

  it('skips the workspace custom application lookup when only standard items read a renamed key', async () => {
    commandMenuItems = buildInitialCommandMenuItems().filter(
      ({ applicationUniversalIdentifier }) =>
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    await command.runOnWorkspace(buildArgs());

    expect(
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow,
    ).not.toHaveBeenCalled();
    expect(getExpressions()).toEqual(['permissionFlags.USER_APPS']);
  });

  it('refreshes the cache and fails when a key changed after it was cached', async () => {
    changeConnectedAccountsKeyAfterCaching();

    await expect(command.runOnWorkspace(buildArgs())).rejects.toThrow(
      'permission flag id-e5f63b2d-5369-5df6-8f32-a8bd9e79e653 no longer has key CONNECTED_ACCOUNTS',
    );
    expect(writes).toEqual(['permission flag cache']);
  });

  it('surfaces the rename error when the cache refresh fails too', async () => {
    changeConnectedAccountsKeyAfterCaching();
    invalidateAndRecompute.mockRejectedValueOnce(new Error('Redis is down'));

    await expect(command.runOnWorkspace(buildArgs())).rejects.toThrow(
      'no longer has key CONNECTED_ACCOUNTS',
    );
    expect(error).toHaveBeenCalledWith(
      `Workspace ${WORKSPACE_ID}: could not refresh the permission flag cache: Error: Redis is down`,
    );
  });
});
