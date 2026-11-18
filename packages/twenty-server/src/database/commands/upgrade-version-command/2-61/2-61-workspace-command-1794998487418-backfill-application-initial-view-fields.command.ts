import { Inject } from '@nestjs/common';
import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingApplicationInitialViewFields } from 'src/database/commands/upgrade-version-command/2-61/utils/build-missing-application-initial-view-fields.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.61.0', 1794998487418)
@Command({
  name: 'upgrade:2-61:backfill-application-initial-view-fields',
  description:
    'Show the fields installed applications added to an object on its user-owned initial view: copy onto it, as visible engine-owned view fields appended after the existing columns, every INDEX column of an application field the initial view does not display yet. Fields added from now on get theirs from fieldInitialObjectViewFieldOnCreate. Idempotent: a field the initial view already displays, or whose column the user removed, is skipped.',
})
export class BackfillApplicationInitialViewFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(WorkspaceMigrationValidateBuildAndRunService)
  private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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
      flatViewMaps,
      flatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

    const flatViewFieldsToCreateByApplicationUniversalIdentifier =
      buildMissingApplicationInitialViewFields({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatViewMaps,
        flatViewFieldMaps,
        twentyStandardApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        now: new Date().toISOString(),
      });

    for (const [
      applicationUniversalIdentifier,
      flatViewFieldsToCreate,
    ] of flatViewFieldsToCreateByApplicationUniversalIdentifier) {
      this.logger.log(
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding ${flatViewFieldsToCreate.length} initial view field(s) for application ${applicationUniversalIdentifier}`,
      );

      if (options.dryRun) {
        continue;
      }

      // A view field belongs to the application owning the field it displays.
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            shouldDeferActions: false,
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              viewField: {
                flatEntityToCreate: flatViewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Validation errors occurred while backfilling initial view fields of application ${applicationUniversalIdentifier} for workspace ${workspaceId}`,
        );
      }
    }
  }
}
