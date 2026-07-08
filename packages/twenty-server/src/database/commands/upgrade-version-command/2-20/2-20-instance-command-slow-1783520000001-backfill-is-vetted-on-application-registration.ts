import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Moves the retired "isFeatured" flag onto the new "isVetted" column, then
// resets "isFeatured" to false. The column is kept around in case we need it.
@RegisteredInstanceCommand('2.20.0', 1783520000001, { type: 'slow' })
export class BackfillIsVettedOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration" SET "isVetted" = "isFeatured"`,
    );
    await dataSource.query(
      `UPDATE "core"."applicationRegistration" SET "isFeatured" = false`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "isFeatured" = "isVetted"`,
    );
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "isVetted" = false`,
    );
  }
}
