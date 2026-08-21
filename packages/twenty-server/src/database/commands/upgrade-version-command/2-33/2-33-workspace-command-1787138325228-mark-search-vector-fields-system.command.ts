import { Command } from 'nest-commander';

import groupBy from 'lodash.groupby';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.33.0', 1787138325228)
@Command({
  name: 'upgrade:2-33:mark-search-vector-fields-system',
  description:
    'Mark searchVector fields as SYSTEM writability on existing workspaces: they are Postgres generated columns nothing may write',
})
export class MarkSearchVectorFieldsSystemCommand extends ProvisionedWorkspaceCommandRunner {
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
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const flatFieldMetadatasToUpdate = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.TS_VECTOR &&
          flatFieldMetadata.writability !== MetadataWritability.SYSTEM,
      )
      .map((flatFieldMetadata) => ({
        ...flatFieldMetadata,
        writability: MetadataWritability.SYSTEM,
      }));

    if (flatFieldMetadatasToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would mark' : 'Marking'} ${flatFieldMetadatasToUpdate.length} search vector field(s) as SYSTEM for workspace ${workspaceId}`,
    );

    const flatFieldMetadatasToUpdateByApplicationUniversalIdentifier = groupBy(
      flatFieldMetadatasToUpdate,
      (flatFieldMetadata) => flatFieldMetadata.applicationUniversalIdentifier,
    );

    for (const [
      applicationUniversalIdentifier,
      flatEntityToUpdate,
    ] of Object.entries(
      flatFieldMetadatasToUpdateByApplicationUniversalIdentifier,
    )) {
      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            dryRun: isDryRun,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate,
              },
            },
          },
        );

      if (validateAndBuildResult.status === 'fail') {
        this.logger.error(
          `Failed to mark search vector fields as SYSTEM:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
        );

        throw new Error(
          `Failed to mark search vector fields as SYSTEM for workspace ${workspaceId}`,
        );
      }
    }
  }
}
