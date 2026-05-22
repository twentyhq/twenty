import { Command } from 'nest-commander';
import { isObjectMetadataManuallyCreatable } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  CREATE_RECORD_COMMAND_UUID_NAMESPACE,
  buildCreateRecordFlatCommandMenuItem,
  buildUpdatedCreateRecordFlatCommandMenuItem,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-create-record-flat-command-menu-item.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { seedCompareObjectMetadataForNavigationPosition } from 'src/engine/metadata-modules/flat-command-menu-item/utils/seed-compare-object-metadata-for-navigation-position.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.8.0', 1799000000000)
@Command({
  name: 'upgrade:2-8:backfill-create-record-command-menu-items',
  description:
    'Backfill missing global create record command menu items for eligible active objects and update create command titles',
})
export class BackfillCreateRecordCommandMenuItemsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling create record command menu items for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const existingCommandMenuItems = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const now = new Date().toISOString();

    let nextPosition =
      existingCommandMenuItems.length > 0
        ? Math.max(...existingCommandMenuItems.map((item) => item.position)) + 1
        : 0;

    const commandMenuItemsToUpdate: FlatCommandMenuItem[] = [];

    const standardCreateRecordCommandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier
      ];

    if (
      isDefined(standardCreateRecordCommandMenuItem) &&
      (standardCreateRecordCommandMenuItem.label !==
        STANDARD_COMMAND_MENU_ITEMS.createNewRecord.label ||
        standardCreateRecordCommandMenuItem.shortLabel !==
          STANDARD_COMMAND_MENU_ITEMS.createNewRecord.shortLabel)
    ) {
      commandMenuItemsToUpdate.push({
        ...standardCreateRecordCommandMenuItem,
        label: STANDARD_COMMAND_MENU_ITEMS.createNewRecord.label,
        shortLabel: STANDARD_COMMAND_MENU_ITEMS.createNewRecord.shortLabel,
        updatedAt: now,
      });
    }

    const commandMenuItemsToCreate = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isObjectMetadataManuallyCreatable)
      .sort(seedCompareObjectMetadataForNavigationPosition)
      .map((flatObjectMetadata) => {
        const createCommandUniversalIdentifier = v5(
          flatObjectMetadata.universalIdentifier,
          CREATE_RECORD_COMMAND_UUID_NAMESPACE,
        );

        const existingCreateCommand =
          flatCommandMenuItemMaps.byUniversalIdentifier[
            createCommandUniversalIdentifier
          ];

        const expectedCreateCommand = buildCreateRecordFlatCommandMenuItem({
          objectMetadata: flatObjectMetadata,
          commandMenuItemId: existingCreateCommand?.id ?? v4(),
          applicationId:
            existingCreateCommand?.applicationId ??
            twentyStandardFlatApplication.id,
          workspaceId,
          position: existingCreateCommand?.position ?? nextPosition++,
          now,
        });

        if (isDefined(existingCreateCommand)) {
          const updatedCreateCommand =
            buildUpdatedCreateRecordFlatCommandMenuItem({
              existingCommandMenuItem: existingCreateCommand,
              objectMetadata: flatObjectMetadata,
              now,
            });

          if (isDefined(updatedCreateCommand)) {
            commandMenuItemsToUpdate.push(updatedCreateCommand);
          }

          return undefined;
        }

        return expectedCreateCommand;
      })
      .filter(isDefined);

    if (
      commandMenuItemsToCreate.length === 0 &&
      commandMenuItemsToUpdate.length === 0
    ) {
      this.logger.log(
        `Create record command menu items already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${commandMenuItemsToCreate.length} create record command menu item(s) to backfill and ${commandMenuItemsToUpdate.length} to update for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill ${commandMenuItemsToCreate.length} create record command menu item(s) and update ${commandMenuItemsToUpdate.length} for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill create record command menu items:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill create record command menu items for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled ${commandMenuItemsToCreate.length} create record command menu item(s) and updated ${commandMenuItemsToUpdate.length} for workspace ${workspaceId}`,
    );
  }
}
