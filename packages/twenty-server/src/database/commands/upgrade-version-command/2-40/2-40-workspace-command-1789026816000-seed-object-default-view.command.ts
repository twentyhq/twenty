import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { SeedObjectDefaultViewService } from 'src/engine/metadata-modules/view/services/seed-object-default-view.service';

@RegisteredWorkspaceCommand('2.40.0', 1789026816000)
@Command({
  name: 'upgrade:2-40:seed-object-default-view',
  description:
    'Seed one regular table view per object alongside its engine-owned INDEX view. The seeded view copies the INDEX view field layout once and is written with isSystemSideEffect: false under the workspace-custom application, so the user owns it and no application sync reaps it. The seeded view stays hidden from every read path until IS_SEEDED_DEFAULT_VIEW_ENABLED is on for the workspace, so this backfill can run long before the client is ready for it. Idempotent per entity on deterministic identifiers: the seeded view and each copied view field are gated independently, so a retry after a partial failure creates only what is missing. Shares SeedObjectDefaultViewService with the provisioning path, so a workspace created after this release is seeded without the backfill running again.',
})
export class SeedObjectDefaultViewCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly seedObjectDefaultViewService: SeedObjectDefaultViewService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      const { totalCreateCount } =
        await this.seedObjectDefaultViewService.computeMissingSeedOperations({
          workspaceId,
        });

      this.logger.log(
        `[DRY RUN] Would seed ${totalCreateCount} default-view entities for workspace ${workspaceId}`,
      );

      return;
    }

    const totalCreateCount =
      await this.seedObjectDefaultViewService.seedMissingObjectDefaultViews({
        workspaceId,
      });

    if (totalCreateCount === 0) {
      this.logger.log(`No default view to seed for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `Seeded ${totalCreateCount} default-view entities for workspace ${workspaceId}`,
    );
  }
}
