import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const FEATURED_UNIVERSAL_IDENTIFIERS = [
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
  '4a1178c1-3535-4a47-b592-231d3216b36f',
  '66a504cc-0a75-410e-a43f-cdeae1db1522'
];

@RegisteredInstanceCommand('2.19.0', 1783120000000, { type: 'slow' })
export class BackfillIsFeaturedOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET "isFeatured" = true
       WHERE "universalIdentifier" = ANY($1::uuid[])`,
      [FEATURED_UNIVERSAL_IDENTIFIERS],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration"
       SET "isFeatured" = false
       WHERE "universalIdentifier" = ANY($1::uuid[])`,
      [FEATURED_UNIVERSAL_IDENTIFIERS],
    );
  }
}
