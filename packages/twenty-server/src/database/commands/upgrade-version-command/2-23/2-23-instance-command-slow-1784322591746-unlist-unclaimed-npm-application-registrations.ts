import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Catalog-synced apps used to be listed automatically. Marketplace listing is
// now curated by server admins, so unlist the auto-synced ones: npm-sourced,
// still unclaimed, and not vetted. Owned or vetted rows are left untouched.
@RegisteredInstanceCommand('2.23.0', 1784322591746, { type: 'slow' })
export class UnlistUnclaimedNpmApplicationRegistrationsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET "isListed" = false
       WHERE "sourceType" = 'npm'
         AND "workspaceId" IS NULL
         AND "isVetted" = false`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Approximate rollback: rows that were manually unlisted before this
    // migration cannot be told apart and may be relisted.
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration"
       SET "isListed" = true
       WHERE "sourceType" = 'npm'
         AND "workspaceId" IS NULL
         AND "isVetted" = false`,
    );
  }
}
