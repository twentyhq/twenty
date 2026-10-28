import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
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

@RegisteredWorkspaceCommand('2.53.0', 1793208282645)
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
  }: Pick<RunOnWorkspaceArgs, 'workspaceId' | 'options'> & {
    direction: 'up' | 'down';
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
      const { flatApplicationMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatApplicationMaps',
        ]);

      const collisionDescriptions = permissionFlagKeyCollisions.map(
        ({ fromKey, toKey, conflictingPermissionFlag }) => {
          const applicationName =
            flatApplicationMaps.byId[conflictingPermissionFlag.applicationId]
              ?.name ?? 'unknown';

          return `${fromKey} cannot become ${toKey}: permission flag ${conflictingPermissionFlag.universalIdentifier} of application "${applicationName}" (${conflictingPermissionFlag.applicationUniversalIdentifier}) already uses that key`;
        },
      );

      throw new Error(
        doNotTranslate(
          `Workspace ${workspaceId}: ${collisionDescriptions.join('; ')}. Permission flag keys cannot change: revoke each conflicting permission flag from every role, uninstall its application, then rerun the upgrade. Afterwards, grant the standard Workspace Apps or User Apps permission again where it was removed. upgrade --dry-run lists the workspaces that still collide.`,
        ),
      );
    }

    const {
      standardCommandMenuItemsToUpdate,
      nonStandardCommandMenuItemsToUpdate,
    } = buildAppPermissionFlagExpressionUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
      direction,
    });

    const customCommandMenuItemsToUpdate =
      await this.filterWorkspaceCustomCommandMenuItems({
        workspaceId,
        commandMenuItems: nonStandardCommandMenuItemsToUpdate,
      });
    // The owning application's next manifest sync would revert a rewrite
    const otherApplicationCommandMenuItems =
      nonStandardCommandMenuItemsToUpdate.filter(
        (commandMenuItem) =>
          !customCommandMenuItemsToUpdate.includes(commandMenuItem),
      );

    const isDryRun = options.dryRun ?? false;
    const logPrefix = `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}`;

    if (isNonEmptyArray(otherApplicationCommandMenuItems)) {
      this.logger.warn(
        doNotTranslate(
          `${logPrefix}: leaving ${otherApplicationCommandMenuItems.length} command menu item(s) of other applications that read a renamed permission flag key: ${otherApplicationCommandMenuItems
            .map(
              ({ id, applicationUniversalIdentifier }) =>
                `${id} (application ${applicationUniversalIdentifier})`,
            )
            .join(', ')}`,
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
      await this.updateStandardCommandMenuItems({
        workspaceId,
        commandMenuItemsToUpdate: standardCommandMenuItemsToUpdate,
      });
    }

    if (isNonEmptyArray(customCommandMenuItemsToUpdate)) {
      await this.updateCustomCommandMenuItems({
        workspaceId,
        logPrefix,
        commandMenuItemsToUpdate: customCommandMenuItemsToUpdate,
      });
    }
  }

  private async filterWorkspaceCustomCommandMenuItems({
    workspaceId,
    commandMenuItems,
  }: {
    workspaceId: string;
    commandMenuItems: FlatCommandMenuItem[];
  }): Promise<FlatCommandMenuItem[]> {
    if (!isNonEmptyArray(commandMenuItems)) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return commandMenuItems.filter(
      ({ applicationUniversalIdentifier }) =>
        applicationUniversalIdentifier ===
        workspaceCustomFlatApplication.universalIdentifier,
    );
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

  // Twenty standard metadata never flows through the side-effect engine (UPGRADE_COMMANDS.md)
  private async updateStandardCommandMenuItems({
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
          `Failed to rename the app permission flag references in the standard command menu items of workspace ${workspaceId}`,
        ),
      );
    }
  }

  // Per item, so an already invalid custom item keeps its old keys instead of failing every rerun
  private async updateCustomCommandMenuItems({
    workspaceId,
    logPrefix,
    commandMenuItemsToUpdate,
  }: {
    workspaceId: string;
    logPrefix: string;
    commandMenuItemsToUpdate: FlatCommandMenuItem[];
  }): Promise<void> {
    const failedCommandMenuItemDescriptions: string[] = [];

    try {
      for (const commandMenuItem of commandMenuItemsToUpdate) {
        const result =
          await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
            {
              workspaceId,
              isSystemBuild: true,
              applicationUniversalIdentifier:
                commandMenuItem.applicationUniversalIdentifier,
              allFlatEntityOperationByMetadataName: {
                commandMenuItem: {
                  flatEntityToCreate: [],
                  flatEntityToDelete: [],
                  flatEntityToUpdate: [commandMenuItem],
                },
              },
            },
          );

        if (result.status === 'fail') {
          const errorCodes = new Set(
            Object.values(result.report)
              .flat()
              .flatMap(({ errors }) => errors.map(({ code }) => code)),
          );

          failedCommandMenuItemDescriptions.push(
            `${commandMenuItem.id} (${[...errorCodes].join(', ')})`,
          );
        }
      }
    } finally {
      if (isNonEmptyArray(failedCommandMenuItemDescriptions)) {
        this.logger.warn(
          doNotTranslate(
            `${logPrefix}: left the permission flag references of ${failedCommandMenuItemDescriptions.length} custom command menu item(s) unchanged because they fail validation: ${failedCommandMenuItemDescriptions.join(', ')}. They keep the old keys and stop matching once the old keys are no longer reported`,
          ),
        );
      }
    }
  }
}
