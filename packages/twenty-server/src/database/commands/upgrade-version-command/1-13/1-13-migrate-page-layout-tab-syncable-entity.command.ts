import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-13:migrate-page-layout-tab-syncable-entity',
  description:
    'Add universalIdentifier and applicationId columns to PageLayoutTab',
})
export class MigratePageLayoutTabSyncableEntityCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log(
        'Skipping has already been run once MigratePageLayoutTabSyncableEntityCommand',
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        'Dry run mode - skipping MigratePageLayoutTabSyncableEntityCommand',
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Add columns as nullable first
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ADD "universalIdentifier" uuid`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ADD "applicationId" uuid`,
      );

      // Populate existing rows with universalIdentifier and applicationId
      await queryRunner.query(
        `UPDATE "core"."pageLayoutTab"
         SET "universalIdentifier" = gen_random_uuid(),
             "applicationId" = (
               SELECT "workspaceCustomApplicationId"
               FROM "core"."workspace"
               WHERE "workspace"."id" = "pageLayoutTab"."workspaceId"
             )
         WHERE "universalIdentifier" IS NULL OR "applicationId" IS NULL`,
      );

      // Add NOT NULL constraints
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ALTER COLUMN "applicationId" SET NOT NULL`,
      );

      // Add unique index and foreign key
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_3763c4e8f942ff1e24040a13a9" ON "core"."pageLayoutTab" ("workspaceId", "universalIdentifier")`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_4493447c2e4029aa26cabf30460" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run MigratePageLayoutTabSyncableEntityCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.log(
        `Rollbacking MigratePageLayoutTabSyncableEntityCommand: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
