import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type AppPermissionFlagKeyRenameDirection } from 'src/database/commands/upgrade-version-command/2-53/types/app-permission-flag-key-rename-direction.type';
import { type PermissionFlagKeyRename } from 'src/database/commands/upgrade-version-command/2-53/types/permission-flag-key-rename.type';
import { buildAppPermissionFlagExpressionUpdates } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-expression-updates.util';
import { buildAppPermissionFlagKeyRenames } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-key-renames.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
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
    private readonly applicationService: ApplicationService,
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
  }: RunOnWorkspaceArgs & {
    direction: AppPermissionFlagKeyRenameDirection;
  }): Promise<void> {
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
          `Workspace ${workspaceId}: ${collisionDescriptions.join('; ')}. Permission flag keys cannot change, so uninstall the application that owns each conflicting permission flag, then rerun the upgrade.`,
        ),
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      standardCommandMenuItemsToUpdate,
      customCommandMenuItemsToUpdate,
      skippedCommandMenuItemCount,
    } = buildAppPermissionFlagExpressionUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      now: new Date().toISOString(),
      direction,
    });

    const isDryRun = options.dryRun ?? false;
    const logPrefix = `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}`;

    if (skippedCommandMenuItemCount > 0) {
      this.logger.warn(
        doNotTranslate(
          `${logPrefix}: leaving ${skippedCommandMenuItemCount} command menu item(s) of other applications that read a renamed permission flag key`,
        ),
      );
    }

    const commandMenuItemCount =
      standardCommandMenuItemsToUpdate.length +
      customCommandMenuItemsToUpdate.length;

    const plannedChanges = [
      isNonEmptyArray(permissionFlagKeyRenames)
        ? `permission flag key(s) ${permissionFlagKeyRenames
            .map(({ fromKey, toKey }) => `${fromKey} -> ${toKey}`)
            .join(', ')}`
        : undefined,
      commandMenuItemCount > 0
        ? `the permission flag references of ${commandMenuItemCount} command menu item(s) (${standardCommandMenuItemsToUpdate.length} standard, ${customCommandMenuItemsToUpdate.length} custom)`
        : undefined,
    ].filter(isDefined);

    if (!isNonEmptyArray(plannedChanges)) {
      return;
    }

    this.logger.log(
      doNotTranslate(`${logPrefix}: renaming ${plannedChanges.join(' and ')}`),
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

    if (isNonEmptyArray(standardCommandMenuItemsToUpdate)) {
      await this.updateCommandMenuItems({
        workspaceId,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        commandMenuItemsToUpdate: standardCommandMenuItemsToUpdate,
      });
    }

    if (isNonEmptyArray(customCommandMenuItemsToUpdate)) {
      await this.updateCommandMenuItems({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        commandMenuItemsToUpdate: customCommandMenuItemsToUpdate,
      });
    }
  }

  // The migration validator forbids key changes (PERMISSION_FLAG_KEY_IMMUTABLE)
  private async updatePermissionFlagKeys({
    workspaceId,
    permissionFlagKeyRenames,
  }: {
    workspaceId: string;
    permissionFlagKeyRenames: PermissionFlagKeyRename[];
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
    } catch (renameError) {
      // A rerun must plan from the database, and a failed refresh must not hide why the rename failed
      await this.refreshPermissionFlagCache(workspaceId).catch(
        (refreshError: unknown) =>
          this.logger.error(
            doNotTranslate(
              `Workspace ${workspaceId}: could not refresh the permission flag cache: ${String(refreshError)}`,
            ),
          ),
      );

      throw renameError;
    }

    await this.refreshPermissionFlagCache(workspaceId);
  }

  private async refreshPermissionFlagCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatPermissionFlagMaps',
    ]);
  }

  private async updateCommandMenuItems({
    workspaceId,
    applicationUniversalIdentifier,
    commandMenuItemsToUpdate,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    commandMenuItemsToUpdate: FlatCommandMenuItem[];
  }): Promise<void> {
    const migrationArgs = {
      workspaceId,
      isSystemBuild: true,
      applicationUniversalIdentifier,
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: commandMenuItemsToUpdate,
        },
      },
    };

    // Twenty standard metadata never flows through the side-effect engine (UPGRADE_COMMANDS.md)
    const result =
      applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
        ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
            migrationArgs,
          )
        : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
            migrationArgs,
          );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        doNotTranslate(
          `Failed to rename the app permission flag references in command menu items of application ${applicationUniversalIdentifier} for workspace ${workspaceId}`,
        ),
      );
    }
  }
}
