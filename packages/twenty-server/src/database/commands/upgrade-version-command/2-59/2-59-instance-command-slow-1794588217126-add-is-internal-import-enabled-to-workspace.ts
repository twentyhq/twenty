import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const INTERNAL_IMPORT_COLUMN_FEATURE_FLAG_KEY =
  'IS_INTERNAL_IMPORT_COLUMN_ENABLED';

@RegisteredInstanceCommand('2.59.0', 1794588217126, { type: 'slow' })
export class AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand implements SlowInstanceCommand {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  // Runs before the column exists: flagged reads fall back to the old column until it is visible.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `INSERT INTO "core"."featureFlag" ("workspaceId", "key", "value")
       SELECT "id", $1, true FROM "core"."workspace"
       ON CONFLICT ("workspaceId", "key") DO UPDATE SET "value" = true`,
      [INTERNAL_IMPORT_COLUMN_FEATURE_FLAG_KEY],
    );

    const workspaces: { id: string }[] = await dataSource.query(
      'SELECT "id" FROM "core"."workspace" ORDER BY "id"',
    );

    for (const workspace of workspaces) {
      await this.workspaceCacheService.flush(workspace.id, ['featureFlagsMap']);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "isInternalImportEnabled" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'UPDATE "core"."workspace" SET "isInternalImportEnabled" = "isInternalMessagesImportEnabled" WHERE "isInternalMessagesImportEnabled" = true',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "core"."featureFlag" WHERE "key" = $1',
      [INTERNAL_IMPORT_COLUMN_FEATURE_FLAG_KEY],
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "isInternalImportEnabled"',
    );
  }
}
