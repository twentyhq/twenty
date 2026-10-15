import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_ID_INDEX_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_VERSION_RUNS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-48/constants/legacy-workflow-run-workflow-version-universal-identifiers.constant';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.48.0', 1792068957511)
@Command({
  name: 'upgrade:2-48:drop-workflow-run-workflow-version-relation',
  description:
    'Drop the relation between workflow runs and workspace workflow versions',
})
export class DropWorkflowRunWorkflowVersionRelationCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const fieldsToDelete = [
      LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      LEGACY_WORKFLOW_VERSION_RUNS_FIELD_UNIVERSAL_IDENTIFIER,
    ]
      .map((universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
      )
      .filter(isDefined);

    const indexesToDelete = [
      findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
        flatEntityMaps: flatIndexMaps,
        universalIdentifier:
          LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_ID_INDEX_UNIVERSAL_IDENTIFIER,
      }),
    ].filter(isDefined);

    if (fieldsToDelete.length === 0 && indexesToDelete.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: dropping ${fieldsToDelete.length} field(s) and ${indexesToDelete.length} index(es) linking workflow runs to workflow versions`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: indexesToDelete,
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: fieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {}
}
