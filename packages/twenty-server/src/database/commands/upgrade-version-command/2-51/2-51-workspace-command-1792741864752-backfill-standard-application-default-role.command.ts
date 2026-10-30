import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@RegisteredWorkspaceCommand('2.51.0', 1792741864752)
@Command({
  name: 'upgrade:2-51:backfill-standard-application-default-role',
  description:
    'Set Admin as the default role of the Twenty standard application',
})
export class BackfillStandardApplicationDefaultRoleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
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

    if (isDefined(twentyStandardFlatApplication.defaultRoleId)) {
      return;
    }

    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    const adminFlatRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    // Without Admin the runtime fallback finds no role either, so behavior is unchanged
    if (!isDefined(adminFlatRole)) {
      this.logger.warn(
        `Workspace ${workspaceId}: no Admin role, standard application default role left unset`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would set Admin as the standard application default role`,
      );

      return;
    }

    await this.applicationService.update(twentyStandardFlatApplication.id, {
      workspaceId,
      defaultRoleId: adminFlatRole.id,
    });

    this.logger.log(
      `Workspace ${workspaceId}: set Admin as the standard application default role`,
    );
  }
}
