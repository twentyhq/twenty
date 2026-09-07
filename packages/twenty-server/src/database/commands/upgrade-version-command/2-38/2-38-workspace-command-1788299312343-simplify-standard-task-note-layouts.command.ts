import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeStandardTaskNoteLayoutMigrationOperations } from 'src/database/commands/upgrade-version-command/2-38/utils/compute-standard-task-note-layout-migration-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.38.0', 1788299312343)
@Command({
  name: 'upgrade:2-38:simplify-standard-task-note-layouts',
  description: 'Simplify uncustomized standard task and note record pages',
})
export class SimplifyStandardTaskNoteLayoutsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'flatPageLayoutMaps',
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatViewFieldGroupMaps',
      ],
    );
    const {
      pageLayoutTabsToDelete,
      viewFieldsToDelete,
      viewFieldGroupsToDelete,
      skippedLayouts,
    } = computeStandardTaskNoteLayoutMigrationOperations({
      flatMaps,
      standardApplicationId: twentyStandardFlatApplication.id,
    });

    for (const skippedLayout of skippedLayouts) {
      this.logger.log(
        `${skippedLayout.label} record page metadata is ${skippedLayout.reason} for workspace ${workspaceId}, skipping`,
      );
    }

    const totalOperationCount =
      pageLayoutTabsToDelete.length +
      viewFieldsToDelete.length +
      viewFieldGroupsToDelete.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Standard task and note record pages already up to date or customized for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} standard task and note record page operation(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutTabsToDelete,
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldGroupsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }

    this.logger.log(
      `Simplified the standard task and note record pages for workspace ${workspaceId}`,
    );
  }
}
