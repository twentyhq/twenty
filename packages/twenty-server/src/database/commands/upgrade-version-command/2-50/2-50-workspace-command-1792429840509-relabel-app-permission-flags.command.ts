import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildPermissionFlagRelabelUpdates } from 'src/database/commands/upgrade-version-command/2-50/utils/build-permission-flag-relabel-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.50.0', 1792429840509)
@Command({
  name: 'upgrade:2-50:relabel-app-permission-flags',
  description:
    'Rename the Applications permission flag to Workspace Apps and the Sync Account permission flag to User Apps in existing workspaces',
})
export class RelabelAppPermissionFlagsCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.relabel({ ...args, direction: 'up' });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.relabel({ ...args, direction: 'down' });
  }

  private async relabel({
    workspaceId,
    options,
    direction,
  }: RunOnWorkspaceArgs & { direction: 'up' | 'down' }): Promise<void> {
    const { flatPermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
      ]);

    const permissionFlagsToUpdate = buildPermissionFlagRelabelUpdates({
      flatPermissionFlagsByUniversalIdentifier:
        flatPermissionFlagMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
      direction,
    });

    if (!isNonEmptyArray(permissionFlagsToUpdate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: relabeling ${permissionFlagsToUpdate.length} permission flag(s)`,
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
            permissionFlag: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: permissionFlagsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to relabel the app permission flags for workspace ${workspaceId}`,
      );
    }
  }
}
