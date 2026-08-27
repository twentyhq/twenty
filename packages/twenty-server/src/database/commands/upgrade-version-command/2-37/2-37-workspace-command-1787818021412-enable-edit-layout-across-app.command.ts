import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LEGACY_EDIT_LAYOUT_AVAILABILITY_EXPRESSION =
  'pageType == "RECORD_PAGE" and not isLayoutCustomizationModeEnabled and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords and objectMetadataItem.nameSingular != "dashboard"';

@RegisteredWorkspaceCommand('2.37.0', 1787818021412)
@Command({
  name: 'upgrade:2-37:enable-edit-layout-across-app',
  description:
    'Make the Edit Layout command available across the app outside Settings',
})
export class EnableEditLayoutAcrossAppCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const standardCommandMenuItem =
      STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout;
    const existingCommandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        standardCommandMenuItem.universalIdentifier
      ];

    if (
      !isDefined(existingCommandMenuItem) ||
      existingCommandMenuItem.availabilityType !==
        CommandMenuItemAvailabilityType.RECORD_SELECTION ||
      existingCommandMenuItem.conditionalAvailabilityExpression !==
        LEGACY_EDIT_LAYOUT_AVAILABILITY_EXPRESSION
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would enable Edit Layout across the app for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...existingCommandMenuItem,
                  availabilityType: standardCommandMenuItem.availabilityType,
                  conditionalAvailabilityExpression:
                    standardCommandMenuItem.conditionalAvailabilityExpression,
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }
  }
}
