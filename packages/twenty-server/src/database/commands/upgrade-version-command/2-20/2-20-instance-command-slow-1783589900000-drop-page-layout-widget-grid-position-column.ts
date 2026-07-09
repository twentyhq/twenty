import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Registered as a slow command so it is sequenced after
// MakePageLayoutWidgetPositionNotNull within 2.20: the upgrade sequence runs
// every fast command before any slow command in a version, and the not-null
// command's data migration must still read "gridPosition" before this drop
// removes it.
@RegisteredInstanceCommand('2.20.0', 1783589900000, { type: 'slow' })
export class DropPageLayoutWidgetGridPositionColumnSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(_dataSource: DataSource): Promise<void> {
    return;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN IF EXISTS "gridPosition"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD COLUMN IF NOT EXISTS "gridPosition" jsonb`,
    );
  }
}
