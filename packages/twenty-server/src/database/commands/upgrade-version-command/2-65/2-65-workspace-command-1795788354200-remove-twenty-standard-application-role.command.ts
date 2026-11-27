import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationGrantRoleService } from 'src/engine/core-modules/application/application-grant-role/services/application-grant-role.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.65.0', 1795788354200)
@Command({
  name: 'upgrade:2-65:remove-twenty-standard-application-role',
  description:
    'Clear the requested role of twenty-standard and delete its grant role',
})
export class RemoveTwentyStandardApplicationRoleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly applicationGrantRoleService: ApplicationGrantRoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatRoleTargetByApplicationIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetByApplicationIdMaps',
      ]);

    const hasRequestedRole = isDefined(
      twentyStandardFlatApplication.requestedRoleId,
    );
    const hasGrantRole = isDefined(
      flatRoleTargetByApplicationIdMaps[twentyStandardFlatApplication.id],
    );

    if (!hasRequestedRole && !hasGrantRole) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: removing the requested role and grant role of twenty-standard`,
    );

    if (options.dryRun) {
      return;
    }

    if (hasRequestedRole) {
      await this.applicationService.update(twentyStandardFlatApplication.id, {
        workspaceId,
        requestedRoleId: null,
      });
    }

    await this.applicationGrantRoleService.deleteGrantRole({
      workspaceId,
      applicationId: twentyStandardFlatApplication.id,
    });
  }
}
