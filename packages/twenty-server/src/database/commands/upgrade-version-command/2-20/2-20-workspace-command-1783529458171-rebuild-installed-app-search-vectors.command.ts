import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.20.0', 1783529458171)
@Command({
  name: 'upgrade:2-20:rebuild-installed-app-search-vectors',
  description:
    'Rebuild the searchVector column of every installed-app TS_VECTOR field from its searchFieldMetadata rows, now that the GIN index and searchFieldMetadata rows exist (commands 1 and 2). Idempotent.',
})
export class RebuildInstalledAppSearchVectorsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
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

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const installedAppTsVectorFlatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.TS_VECTOR &&
          flatFieldMetadata.applicationId !==
            twentyStandardFlatApplication.id &&
          flatFieldMetadata.applicationId !== workspaceCustomFlatApplication.id,
      );

    if (installedAppTsVectorFlatFieldMetadatas.length === 0) {
      this.logger.log(
        `No installed-app searchVector to rebuild for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Rebuilding ${installedAppTsVectorFlatFieldMetadatas.length} installed-app searchVector(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const actions: UniversalUpdateFieldAction[] =
      installedAppTsVectorFlatFieldMetadatas.map((flatFieldMetadata) => ({
        type: WORKSPACE_MIGRATION_ACTION_TYPE.update,
        metadataName: 'fieldMetadata',
        universalIdentifier: flatFieldMetadata.universalIdentifier,
        update: {},
        rebuildSearchVector: true,
      }));

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
      `Rebuilt ${installedAppTsVectorFlatFieldMetadatas.length} installed-app searchVector(s) for workspace ${workspaceId}`,
    );
  }
}
