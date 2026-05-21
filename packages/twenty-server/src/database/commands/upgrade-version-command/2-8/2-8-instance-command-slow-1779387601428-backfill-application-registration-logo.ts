import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.8.0', 1779387601428, { type: 'slow' })
export class BackfillApplicationRegistrationLogoSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      UPDATE "core"."applicationRegistration"
      SET "logo" = manifest->'application'->>'logoUrl'
      WHERE manifest IS NOT NULL
        AND manifest->'application'->>'logoUrl' IS NOT NULL
        AND "logo" IS NULL
    `);
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
