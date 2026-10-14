import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildWorkflowRunIndexWorkflowVersionViewFieldOperations } from 'src/database/commands/upgrade-version-command/2-47/utils/build-workflow-run-index-workflow-version-view-field-operations.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.47.0', 1791967167859)
@Command({
  name: 'upgrade:2-47:remove-workflow-run-index-workflow-version-column',
  description:
    'Remove the "Workflow version" column from the workflow runs index view',
})
export class RemoveWorkflowRunIndexWorkflowVersionColumnCommand extends ProvisionedWorkspaceCommandRunner {
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

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncWorkflowVersionColumn(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncWorkflowVersionColumn(args, 'down');
  }

  private async syncWorkflowVersionColumn(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const flatMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps', 'flatViewFieldMaps', 'flatFieldMetadataMaps'],
    );

    const { viewFieldsToCreate, viewFieldsToDelete } =
      buildWorkflowRunIndexWorkflowVersionViewFieldOperations({
        flatMaps,
        now: new Date().toISOString(),
        direction,
      });

    const applicationUniversalIdentifiers = new Set(
      [...viewFieldsToCreate, ...viewFieldsToDelete].map(
        (viewField) => viewField.applicationUniversalIdentifier,
      ),
    );

    if (applicationUniversalIdentifiers.size === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${direction === 'up' ? 'removing' : 'restoring'} the workflow runs "Workflow version" column`,
    );

    if (options.dryRun) {
      return;
    }

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const isOwnedByApplication = (viewField: FlatViewField) =>
        viewField.applicationUniversalIdentifier ===
        applicationUniversalIdentifier;

      const migrationArgs = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: viewFieldsToCreate.filter(isOwnedByApplication),
            flatEntityToDelete: viewFieldsToDelete.filter(isOwnedByApplication),
            flatEntityToUpdate: [],
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
