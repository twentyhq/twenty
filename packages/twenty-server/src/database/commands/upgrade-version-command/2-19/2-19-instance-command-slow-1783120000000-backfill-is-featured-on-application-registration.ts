import { isDefined } from 'twenty-shared/utils';
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
    // Every fast command runs before every slow one regardless of version, so
    // 2.20's rename of isFeatured to isVetted has already happened by the time
    // this runs on an instance upgrading across both versions. Target whichever
    // name the schema actually has, and do nothing if the column is gone
    // entirely.
    const columns = await dataSource.query<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'core'
         AND table_name = 'applicationRegistration'
         AND column_name IN ('isVetted', 'isFeatured')
       ORDER BY column_name = 'isVetted' DESC
       LIMIT 1`,
    );
    const targetColumn = columns[0]?.column_name;

    if (!isDefined(targetColumn)) {
      return;
    }

    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET "${targetColumn}" = true
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
