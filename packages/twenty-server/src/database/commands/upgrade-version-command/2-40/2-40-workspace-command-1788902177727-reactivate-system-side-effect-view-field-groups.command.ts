import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeRecordPageReconcileFlatEntityMapsKeys } from 'src/database/commands/upgrade-version-command/2-31/utils/compute-record-page-reconcile-flat-entity-maps-keys.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

// Must match ReconcileStandardRecordPageCommand's @Command name.
const RECONCILE_STANDARD_RECORD_PAGE_COMMAND_NAME =
  'upgrade:2-31:reconcile-standard-record-page';

// A group updated no later than shortly after the 2-31 reconcile ran was
// never touched again afterward: any deliberate deactivation through
// upsertFieldsWidget (removing a section in the fields widget) bumps
// updatedAt past this point, so it is excluded and left alone.
const REACTIVATION_SAFETY_MARGIN_MS = 5 * 60 * 1000;

const REACTIVATION_BATCH_SIZE = 200;

@RegisteredWorkspaceCommand('2.40.0', 1788902177727)
@Command({
  name: 'upgrade:2-40:reactivate-system-side-effect-view-field-groups',
  description:
    'Reactivate isSystemSideEffect view field groups left isActive=false since before the 2-31 record-page reconcile ran, without touching groups deactivated on purpose afterward through the fields widget',
})
export class ReactivateSystemSideEffectViewFieldGroupsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewFieldGroupEntity)
    private readonly viewFieldGroupRepository: Repository<ViewFieldGroupEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(UpgradeMigrationEntity)
    private readonly upgradeMigrationRepository: Repository<UpgradeMigrationEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const reconcileRun = await this.upgradeMigrationRepository.findOne({
      where: {
        name: RECONCILE_STANDARD_RECORD_PAGE_COMMAND_NAME,
        workspaceId,
        status: 'completed',
      },
      order: { attempt: 'DESC' },
    });

    if (!isDefined(reconcileRun)) {
      // Workspace was created after 2.31 became current: its groups are
      // created isActive=true from the start, so isActive=false here can
      // only be a deliberate deactivation, never leave that alone.
      this.logger.log(
        `Workspace ${workspaceId} never ran the 2-31 record-page reconcile, skipping`,
      );

      return;
    }

    const reactivationCutoff = new Date(
      reconcileRun.createdAt.getTime() + REACTIVATION_SAFETY_MARGIN_MS,
    );

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
          group.deletedAt === null &&
          new Date(group.updatedAt) <= reactivationCutoff,
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

    const groupIds = inactiveSystemGroups.map((group) => group.id);

    for (const idsBatch of chunk(groupIds, REACTIVATION_BATCH_SIZE)) {
      await this.viewFieldGroupRepository.update(
        { id: In(idsBatch), workspaceId },
        { isActive: true },
      );
    }

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: computeRecordPageReconcileFlatEntityMapsKeys(),
      workspaceId,
    });

    this.logger.log(
      `Reactivated ${inactiveSystemGroups.length} view field group(s) for workspace ${workspaceId}`,
    );
  }
}
