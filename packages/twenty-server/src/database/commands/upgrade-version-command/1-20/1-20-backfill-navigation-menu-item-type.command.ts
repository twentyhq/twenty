import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { makeNavigationMenuItemTypeNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773681736596-makeNavigationMenuItemTypeNotNull.util';

@Command({
  name: 'upgrade:1-20:backfill-navigation-menu-item-type',
  description:
    'Backfill navigation menu item type based on existing columns, then apply NOT NULL and CHECK constraints',
})
export class BackfillNavigationMenuItemTypeCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  private hasRunOnce = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.warn(
        'Skipping has already been run once BackfillNavigationMenuItemTypeCommand',
      );

      return;
    }

    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.backfillType(queryRunner);
      await this.cleanConflictingColumns(queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back BackfillNavigationMenuItemTypeCommand data backfill: ${error.message}`,
      );

      await queryRunner.release();

      return;
    }

    await queryRunner.startTransaction();

    try {
      await makeNavigationMenuItemTypeNotNullQueries(queryRunner);
      await queryRunner.commitTransaction();
      this.logger.log('Successfully run BackfillNavigationMenuItemTypeCommand');
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back BackfillNavigationMenuItemTypeCommand schema changes: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async backfillType(
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
  ): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "type" = 'OBJECT' WHERE "type" = 'VIEW' AND "targetObjectMetadataId" IS NOT NULL AND "targetRecordId" IS NULL`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "type" = 'RECORD' WHERE "type" IS NULL AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "type" = 'OBJECT' WHERE "type" IS NULL AND "targetObjectMetadataId" IS NOT NULL AND "targetRecordId" IS NULL`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "type" = 'VIEW' WHERE "type" IS NULL AND "viewId" IS NOT NULL`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "type" = 'LINK' WHERE "type" IS NULL AND "link" IS NOT NULL`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "type" = 'FOLDER' WHERE "type" IS NULL`,
    );
  }

  private async cleanConflictingColumns(
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
  ): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "targetRecordId" = NULL, "targetObjectMetadataId" = NULL, "link" = NULL WHERE "type" = 'VIEW'`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "viewId" = NULL, "link" = NULL WHERE "type" = 'RECORD'`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "viewId" = NULL, "targetRecordId" = NULL, "link" = NULL WHERE "type" = 'OBJECT'`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "viewId" = NULL, "targetRecordId" = NULL, "targetObjectMetadataId" = NULL WHERE "type" = 'LINK'`,
    );

    await queryRunner.query(
      `UPDATE "core"."navigationMenuItem" SET "viewId" = NULL, "targetRecordId" = NULL, "targetObjectMetadataId" = NULL, "link" = NULL WHERE "type" = 'FOLDER'`,
    );
  }
}
