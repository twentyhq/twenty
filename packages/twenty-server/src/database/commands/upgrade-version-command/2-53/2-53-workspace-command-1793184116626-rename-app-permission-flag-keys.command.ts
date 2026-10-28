import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildAppPermissionFlagExpressionUpdates } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-expression-updates.util';
import { buildAppPermissionFlagKeyRenames } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-key-renames.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.53.0', 1793184116626)
@Command({
  name: 'upgrade:2-53:rename-app-permission-flag-keys',
  description: doNotTranslate(
    'Rename the CONNECTED_ACCOUNTS and APPLICATIONS permission flag keys to USER_APPS and WORKSPACE_APPS, along with the command menu expressions that read them',
  ),
})
export class RenameAppPermissionFlagKeysCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.renameKeys({ ...args, direction: 'up' });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.renameKeys({ ...args, direction: 'down' });
  }

  private async renameKeys({
    workspaceId,
    options,
    direction,
  }: RunOnWorkspaceArgs & { direction: 'up' | 'down' }): Promise<void> {
    const { flatPermissionFlagMaps, flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
        'flatCommandMenuItemMaps',
      ]);

    const { permissionFlagKeyRenames, permissionFlagKeyCollisions } =
      buildAppPermissionFlagKeyRenames({
        flatPermissionFlagsByUniversalIdentifier:
          flatPermissionFlagMaps.byUniversalIdentifier,
        direction,
      });

    if (isNonEmptyArray(permissionFlagKeyCollisions)) {
      const collisionDescriptions = permissionFlagKeyCollisions.map(
        ({ fromKey, toKey, conflictingPermissionFlag }) =>
          `${fromKey} cannot become ${toKey}: permission flag ${conflictingPermissionFlag.universalIdentifier} of application ${conflictingPermissionFlag.applicationUniversalIdentifier} already uses that key`,
      );

      throw new Error(
        doNotTranslate(
          `Workspace ${workspaceId}: ${collisionDescriptions.join('; ')}. Rename or remove the conflicting permission flag, then rerun the upgrade.`,
        ),
      );
    }

    const commandMenuItemsToUpdate = buildAppPermissionFlagExpressionUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
      direction,
    });

    if (
      !isNonEmptyArray(permissionFlagKeyRenames) &&
      !isNonEmptyArray(commandMenuItemsToUpdate)
    ) {
      return;
    }

    const isDryRun = options.dryRun ?? false;
    const renamedKeys = permissionFlagKeyRenames.map(
      ({ fromKey, toKey }) => `${fromKey} -> ${toKey}`,
    );

    this.logger.log(
      doNotTranslate(
        `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: renaming permission flag key(s) [${renamedKeys.join(', ')}] and ${commandMenuItemsToUpdate.length} command menu item expression(s)`,
      ),
    );

    if (isDryRun) {
      return;
    }

    if (isNonEmptyArray(permissionFlagKeyRenames)) {
      await this.updatePermissionFlagKeys({
        workspaceId,
        permissionFlagKeyRenames,
      });
    }

    if (isNonEmptyArray(commandMenuItemsToUpdate)) {
      await this.updateCommandMenuItems({
        workspaceId,
        commandMenuItemsToUpdate,
      });
    }
  }

  // The migration validator forbids key changes (PERMISSION_FLAG_KEY_IMMUTABLE)
  private async updatePermissionFlagKeys({
    workspaceId,
    permissionFlagKeyRenames,
  }: {
    workspaceId: string;
    permissionFlagKeyRenames: {
      permissionFlagId: string;
      fromKey: string;
      toKey: string;
    }[];
  }): Promise<void> {
    try {
      await this.coreDataSource.transaction(async (entityManager) => {
        for (const {
          permissionFlagId,
          fromKey,
          toKey,
        } of permissionFlagKeyRenames) {
          const { affected } = await entityManager.update(
            PermissionFlagEntity,
            { id: permissionFlagId, workspaceId, key: fromKey },
            { key: toKey },
          );

          if (affected !== 1) {
            throw new Error(
              doNotTranslate(
                `Workspace ${workspaceId}: permission flag ${permissionFlagId} no longer has key ${fromKey}`,
              ),
            );
          }
        }
      });
    } finally {
      // Even on failure, so a rerun plans from the database, not a stale cache
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatPermissionFlagMaps',
      ]);
    }
  }

  private async updateCommandMenuItems({
    workspaceId,
    commandMenuItemsToUpdate,
  }: {
    workspaceId: string;
    commandMenuItemsToUpdate: FlatCommandMenuItem[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        doNotTranslate(
          `Failed to rename the app permission flag references in command menu items for workspace ${workspaceId}`,
        ),
      );
    }
  }
}
