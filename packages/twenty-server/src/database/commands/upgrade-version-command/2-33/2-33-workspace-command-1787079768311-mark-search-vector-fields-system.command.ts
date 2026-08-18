import { Command } from 'nest-commander';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.33.0', 1787079768311)
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

    const searchVectorFieldsToFlip = Object.values(
      flatFieldMetadataMaps.byId,
    ).filter(
      (flatFieldMetadata): flatFieldMetadata is FlatFieldMetadata =>
        isDefined(flatFieldMetadata) &&
        flatFieldMetadata.type === FieldMetadataType.TS_VECTOR &&
        flatFieldMetadata.writability !== MetadataWritability.SYSTEM,
    );

    if (searchVectorFieldsToFlip.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would mark ${searchVectorFieldsToFlip.length} search vector field(s) as SYSTEM for workspace ${workspaceId}`,
      );

      return;
    }

    const fieldsByApplicationUniversalIdentifier = new Map<
      string,
      FlatFieldMetadata[]
    >();

    for (const flatFieldMetadata of searchVectorFieldsToFlip) {
      const applicationFields =
        fieldsByApplicationUniversalIdentifier.get(
          flatFieldMetadata.applicationUniversalIdentifier,
        ) ?? [];

      applicationFields.push({
        ...flatFieldMetadata,
        writability: MetadataWritability.SYSTEM,
      });
      fieldsByApplicationUniversalIdentifier.set(
        flatFieldMetadata.applicationUniversalIdentifier,
        applicationFields,
      );
    }

    for (const [
      applicationUniversalIdentifier,
      flatEntityToUpdate,
    ] of fieldsByApplicationUniversalIdentifier) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate,
              },
            },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to mark search vector fields as SYSTEM:\n${JSON.stringify(result, null, 2)}`,
        );

        throw new Error(
          `Failed to mark search vector fields as SYSTEM for workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Marked ${searchVectorFieldsToFlip.length} search vector field(s) as SYSTEM for workspace ${workspaceId}`,
    );
  }
}
