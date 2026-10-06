import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildLegacyWorkflowSoftRefFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/utils/build-legacy-workflow-soft-ref-flat-field-metadata.util';
import {
  LEGACY_WORKFLOW_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/utils/legacy-workflow-workspace-entity.type';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.23.0', 1784286706000)
@Command({
  name: 'upgrade:2-23:add-workflow-core-soft-ref-field',
  description:
    'Add the workflow.coreWorkflowId system field on existing workspaces that predate it',
})
export class AddWorkflowCoreSoftRefFieldCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const workflowObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(workflowObjectMetadata)) {
      this.logger.log(
        `workflow object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_WORKFLOW_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add coreWorkflowId field for workspace ${workspaceId}`,
      );

      return;
    }

    const flatFieldMetadataToCreate =
      buildLegacyWorkflowSoftRefFlatFieldMetadata({
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        flatObjectMetadata: workflowObjectMetadata,
        universalIdentifier:
          LEGACY_WORKFLOW_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER,
        name: 'coreWorkflowId',
        label: 'Core workflow id',
        description: 'Reference to the core workflow row',
      });

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [flatFieldMetadataToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add coreWorkflowId field:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add coreWorkflowId field for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Added coreWorkflowId field for workspace ${workspaceId}`);
  }
}
