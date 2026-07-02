import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1825000001000, { type: 'slow' })
export class AddLogoToApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    // runDataMigration executes before up, so ensure the column exists
    // before backfilling it from the manifest jsonb
    await dataSource.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "logo" text',
    );

    await dataSource.query(
      `UPDATE "core"."applicationRegistration" SET "logo" = "manifest"->'application'->>'logoUrl' WHERE "manifest" IS NOT NULL AND "logo" IS NULL`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "logo" text',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "logo"',
    );
  }
}
