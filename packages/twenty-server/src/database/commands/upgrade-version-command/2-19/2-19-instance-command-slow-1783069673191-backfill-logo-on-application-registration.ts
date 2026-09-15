import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783069673191, { type: 'slow' })
export class BackfillLogoOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration" SET "logo" = "manifest"->'application'->>'logoUrl' WHERE "manifest" IS NOT NULL AND "logo" IS NULL`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "core"."applicationRegistration" SET "logo" = NULL',
    );
  }
}
