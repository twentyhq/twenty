import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeRecordPageReconcileFlatEntityMapsKeys } from 'src/database/commands/upgrade-version-command/2-31/utils/compute-record-page-reconcile-flat-entity-maps-keys.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.40.0', 1788902177727)
@Command({
  name: 'upgrade:2-40:reactivate-system-side-effect-view-field-groups',
  description:
    'Reactivate isSystemSideEffect view field groups left isActive=false from before the 2-31 record-page reconcile existed, which hides their fields-widget section instead of just renaming/flagging it',
})
export class ReactivateSystemSideEffectViewFieldGroupsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewFieldGroupEntity)
    private readonly viewFieldGroupRepository: Repository<ViewFieldGroupEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatViewFieldGroupMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewFieldGroupMaps',
      ]);

    const inactiveSystemGroups = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) =>
          group.isSystemSideEffect &&
          !group.isActive &&
          group.deletedAt === null,
      );

    if (inactiveSystemGroups.length === 0) {
      this.logger.log(
        `No inactive system-owned view field groups to reactivate for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would reactivate ${inactiveSystemGroups.length} view field group(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.viewFieldGroupRepository.update(
      { id: In(inactiveSystemGroups.map((group) => group.id)), workspaceId },
      { isActive: true },
    );

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: computeRecordPageReconcileFlatEntityMapsKeys(),
      workspaceId,
    });

    this.logger.log(
      `Reactivated ${inactiveSystemGroups.length} view field group(s) for workspace ${workspaceId}`,
    );
  }
}
