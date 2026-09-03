import { Command } from 'nest-commander';
import {
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildGateWorkflowVersionNavigationCommandMenuItemUpdate } from 'src/database/commands/upgrade-version-command/2-38/utils/build-gate-workflow-version-navigation-command-menu-item-update.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.38.0', 1788340845000)
@Command({
  name: 'upgrade:2-38:gate-workflow-version-navigation-by-core-index-flag',
  description:
    'Hide the Go to Workflow Versions navigation command menu item when the workflow core index feature flag is enabled',
})
export class GateWorkflowVersionNavigationByCoreIndexFlagCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const universalIdentifier =
      getSystemNavigationCommandMenuItemUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    const existingCommandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];

    if (!isDefined(existingCommandMenuItem)) {
      this.logger.warn(
        `No workflow version navigation command menu item found for workspace ${workspaceId}, leaving it untouched`,
      );

      return;
    }

    const commandMenuItemToUpdate =
      buildGateWorkflowVersionNavigationCommandMenuItemUpdate({
        existingCommandMenuItem,
        conditionalAvailabilityExpression:
          buildNavigationConditionalAvailabilityExpression({
            universalIdentifier:
              STANDARD_OBJECTS.workflowVersion.universalIdentifier,
            nameSingular: CoreObjectNameSingular.WorkflowVersion,
          }),
        now: new Date().toISOString(),
      });

    if (!isDefined(commandMenuItemToUpdate)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would gate the workflow version navigation command for workspace ${workspaceId}`,
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
              flatEntityToUpdate: [commandMenuItemToUpdate],
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
