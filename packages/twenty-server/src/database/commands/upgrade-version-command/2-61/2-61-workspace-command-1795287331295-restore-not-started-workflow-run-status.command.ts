import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-61/constants/restore-not-started-workflow-run-status.constant';
import { buildNotStartedWorkflowRunStatusFieldRestore } from 'src/database/commands/upgrade-version-command/2-61/utils/build-not-started-workflow-run-status-field-restore.util';
import { buildStopWorkflowRunCommandMenuItemRestore } from 'src/database/commands/upgrade-version-command/2-61/utils/build-stop-workflow-run-command-menu-item-restore.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.61.0', 1795287331295)
@Command({
  name: 'upgrade:2-61:restore-not-started-workflow-run-status',
  description:
    'Restore the NOT_STARTED workflow run status option, its default and the Stop command expression where they were dropped',
})
export class RestoreNotStartedWorkflowRunStatusCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatFieldMetadataOptionMaps',
      'flatCommandMenuItemMaps',
    ]);

    const statusField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.fields.status.universalIdentifier
      ];

    if (
      !isDefined(statusField) ||
      !isFlatFieldMetadataOfType(statusField, FieldMetadataType.SELECT)
    ) {
      this.logger.log(
        `No workflowRun status field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const now = new Date().toISOString();
    const statusFieldToUpdate = buildNotStartedWorkflowRunStatusFieldRestore({
      statusField,
      now,
    });
    const stopCommandMenuItemToUpdate =
      buildStopWorkflowRunCommandMenuItemRestore({
        stopCommandMenuItem:
          flatCommandMenuItemMaps.byUniversalIdentifier[
            STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
          ],
        now,
      });

    if (
      !isDefined(statusFieldToUpdate) &&
      !isDefined(stopCommandMenuItemToUpdate)
    ) {
      return;
    }

    const statusFieldsToUpdate = isDefined(statusFieldToUpdate)
      ? [statusFieldToUpdate]
      : [];

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would restore the NOT_STARTED workflow run status for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: statusFieldsToUpdate,
            },
            fieldMetadataOption:
              computeFieldMetadataOptionOperationsForFieldMetadatas({
                flatFieldMetadatasToUpdate: statusFieldsToUpdate,
                existingFlatFieldMetadataOptionMaps: flatFieldMetadataOptionMaps,
                applicationUniversalIdentifier:
                  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
              }),
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: isDefined(stopCommandMenuItemToUpdate)
                ? [stopCommandMenuItemToUpdate]
                : [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to restore the NOT_STARTED workflow run status for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
