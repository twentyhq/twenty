import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  NOT_STARTED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE,
  NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION,
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION_WITHOUT_NOT_STARTED,
  STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-61/constants/restore-not-started-workflow-run-status.constant';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Only workspaces upgraded or created from main while #30841 was merged lost the status; the others are a no-op
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
    const statusOptions = statusField.options ?? [];
    const hasNotStartedOption = statusOptions.some(
      ({ value }) => value === NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION.value,
    );

    const statusFieldsToUpdate = hasNotStartedOption
      ? []
      : [
          {
            ...statusField,
            options: [NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION, ...statusOptions],
            defaultValue: NOT_STARTED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE,
            updatedAt: now,
          },
        ];

    const stopCommandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
      ];

    const stopCommandMenuItemsToUpdate =
      isDefined(stopCommandMenuItem) &&
      stopCommandMenuItem.conditionalAvailabilityExpression ===
        STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION_WITHOUT_NOT_STARTED
        ? [
            {
              ...stopCommandMenuItem,
              conditionalAvailabilityExpression:
                STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
              updatedAt: now,
            },
          ]
        : [];

    if (
      statusFieldsToUpdate.length === 0 &&
      stopCommandMenuItemsToUpdate.length === 0
    ) {
      return;
    }

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
              flatEntityToUpdate: stopCommandMenuItemsToUpdate,
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
