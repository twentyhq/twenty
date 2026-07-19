import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.18.0', 1799200001000)
@Command({
  name: 'upgrade:2-18:recompute-search-vectors',
  description:
    'Recompute every TS_VECTOR (searchVector) column from its searchFieldMetadata rows, recreate its GIN index, and clear the deprecated cached TS_VECTOR settings. Idempotent.',
})
export class RecomputeSearchVectorsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
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

    const tsVectorFlatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.TS_VECTOR,
      );

    if (tsVectorFlatFieldMetadatas.length === 0) {
      this.logger.log(
        `No TS_VECTOR fields for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Recomputing ${tsVectorFlatFieldMetadatas.length} search vector(s) and clearing their settings for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const actions: UniversalUpdateFieldAction[] = tsVectorFlatFieldMetadatas.map(
      (flatFieldMetadata) => ({
        type: WORKSPACE_MIGRATION_ACTION_TYPE.update,
        metadataName: 'fieldMetadata',
        universalIdentifier: flatFieldMetadata.universalIdentifier,
        update: { universalSettings: null },
        rebuildSearchVector: true,
      }),
    );

    await this.workspaceMigrationRunnerService.run({
      workspaceMigration: {
        // Cross-app actions; this is only the runner's existence gate, not a scope filter.
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        actions,
      },
      workspaceId,
    });

    this.logger.log(
      `Successfully recomputed ${tsVectorFlatFieldMetadatas.length} search vector(s) for workspace ${workspaceId}`,
    );
  }
}
