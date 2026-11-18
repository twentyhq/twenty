import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.60.0', 1794992743917, { type: 'slow' })
export class BackfillApplicationRequestedRoleIdSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'UPDATE "core"."application" SET "requestedRoleId" = "defaultRoleId" WHERE "requestedRoleId" IS NULL AND "defaultRoleId" IS NOT NULL',
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Not reverted: backfilled rows cannot be told apart from dual-written ones
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
