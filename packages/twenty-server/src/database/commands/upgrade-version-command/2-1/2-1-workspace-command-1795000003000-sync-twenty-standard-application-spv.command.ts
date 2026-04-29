import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource, type QueryRunner } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

// SPV fork: replays the standard-application sync for every existing
// workspace so the new OpportunityMilestone + OpportunityMilestoneDependency
// objects (and their fields, views, page layouts) materialize without a
// workspace re-init. The sync is a no-op for workspaces that already match
// the desired state, so re-running it is safe.
//
// Self-heal note: production hit a state where the upgrade_migration table
// recorded `1.23.0_AddRoadmapPlannedStartFastInstanceCommand_1777393924993`
// as completed but the actual ALTER TABLE never reached RDS. The runner
// short-circuits on `isLastAttemptCompleted`, so the original migration
// won't re-run on its own. We patch around that by re-asserting the five
// view extension columns at the start of this workspace command — every
// statement is `IF NOT EXISTS` / `DROP IF EXISTS` so it's a no-op once
// the schema matches.
@RegisteredWorkspaceCommand('2.1.0', 1795000003000)
@Command({
  name: 'upgrade:2-1:sync-twenty-standard-application-spv',
  description:
    'Sync the twenty-standard application across existing workspaces so new SPV standard objects (OpportunityMilestone, dependencies) appear without a re-init.',
})
export class SyncTwentyStandardApplicationSpvCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  // Latched once per process so the schema repair doesn't fire N times when
  // the iterator visits N workspaces. The DDL is idempotent either way; the
  // flag just keeps logs clean and avoids needless transactions.
  private hasEnsuredSchema = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would sync twenty-standard application for workspace ${workspaceId}`,
      );

      return;
    }

    if (!this.hasEnsuredSchema) {
      await this.ensureRoadmapViewColumnsExist();
      this.hasEnsuredSchema = true;
    }

    this.logger.log(
      `Syncing twenty-standard application for workspace ${workspaceId}`,
    );

    await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
      { workspaceId },
    );

    this.logger.log(
      `Synced twenty-standard application for workspace ${workspaceId}`,
    );
  }

  private async ensureRoadmapViewColumnsExist(): Promise<void> {
    this.logger.log(
      'Ensuring core.view roadmap extension columns + FKs exist (defensive re-application)',
    );

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.query(
        'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldPlannedStartId" uuid',
      );
      await queryRunner.query(
        'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldPlannedEndId" uuid',
      );
      await queryRunner.query(
        'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldStatusId" uuid',
      );
      await queryRunner.query(
        'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldBlockedById" uuid',
      );
      await queryRunner.query(
        'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapShowDeviation" boolean NOT NULL DEFAULT false',
      );

      await this.recreateForeignKey(
        queryRunner,
        'FK_beff39ca2d14078baca4344e44d',
        'roadmapFieldPlannedStartId',
      );
      await this.recreateForeignKey(
        queryRunner,
        'FK_71c63d7c2763b05a8d185afc5db',
        'roadmapFieldPlannedEndId',
      );
      await this.recreateForeignKey(
        queryRunner,
        'FK_ed798d330539053631e4e446e68',
        'roadmapFieldStatusId',
      );
      await this.recreateForeignKey(
        queryRunner,
        'FK_e31ef3d304e09d7bae63d6e1290',
        'roadmapFieldBlockedById',
      );

      await queryRunner.commitTransaction();
      this.logger.log('Roadmap view extension schema is up to date');
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async recreateForeignKey(
    queryRunner: QueryRunner,
    constraintName: string,
    columnName: string,
  ): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "${constraintName}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${columnName}") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
