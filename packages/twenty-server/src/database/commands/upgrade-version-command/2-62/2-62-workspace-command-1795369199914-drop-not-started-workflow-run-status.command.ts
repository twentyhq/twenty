import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  NOT_STARTED_WORKFLOW_RUN_STATUS,
  STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-62/constants/drop-not-started-workflow-run-status.constant';
import { buildStopWorkflowRunCommandMenuItemUpdate } from 'src/database/commands/upgrade-version-command/2-62/utils/build-stop-workflow-run-command-menu-item-update.util';
import { buildWorkflowRunStatusFieldUpdate } from 'src/database/commands/upgrade-version-command/2-62/utils/build-workflow-run-status-field-update.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@RegisteredWorkspaceCommand('2.62.0', 1795369199914)
@Command({
  name: 'upgrade:2-62:drop-not-started-workflow-run-status',
  description:
    'Move the workflow runs still NOT_STARTED to ENQUEUED, where the stale-run sweep gives them a job, then remove the NOT_STARTED status option and make ENQUEUED the default',
})
export class DropNotStartedWorkflowRunStatusCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatFieldMetadataOptionMaps',
      'flatCommandMenuItemMaps',
    ]);

    const workflowRunObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ];
    const statusField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.fields.status.universalIdentifier
      ];

    if (
      !isDefined(workflowRunObject) ||
      !isDefined(statusField) ||
      !isFlatFieldMetadataOfType(statusField, FieldMetadataType.SELECT)
    ) {
      this.logger.log(
        `No workflowRun status field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const now = new Date().toISOString();
    const statusFieldToUpdate = buildWorkflowRunStatusFieldUpdate({
      statusField,
      now,
    });
    const stopCommandMenuItemToUpdate =
      buildStopWorkflowRunCommandMenuItemUpdate({
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

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop the NOT_STARTED workflow run status for workspace ${workspaceId}`,
      );

      return;
    }

    const workflowRunTable = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(workflowRunObject))}`;

    // Rows must leave the value before the enum rebuild drops it; a failed migration leaves them ENQUEUED, which the sweep handles
    const [, convertedRunCount]: [unknown[], number] =
      await this.dataSource.query(
        `UPDATE ${workflowRunTable} SET status = 'ENQUEUED', "enqueuedAt" = NULL WHERE status::text = $1`,
        [NOT_STARTED_WORKFLOW_RUN_STATUS],
      );

    if (convertedRunCount > 0) {
      this.logger.log(
        `Moved ${convertedRunCount} NOT_STARTED workflow run(s) to ENQUEUED for workspace ${workspaceId}`,
      );
    }

    const fieldMetadataOperations = {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: isDefined(statusFieldToUpdate)
        ? [statusFieldToUpdate]
        : [],
    };

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: fieldMetadataOperations,
            fieldMetadataOption:
              computeFieldMetadataOptionOperationsForFieldMetadatas({
                flatFieldMetadatasToUpdate:
                  fieldMetadataOperations.flatEntityToUpdate,
                existingFlatFieldMetadataOptionMaps:
                  flatFieldMetadataOptionMaps,
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
        `Failed to drop the NOT_STARTED workflow run status for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
