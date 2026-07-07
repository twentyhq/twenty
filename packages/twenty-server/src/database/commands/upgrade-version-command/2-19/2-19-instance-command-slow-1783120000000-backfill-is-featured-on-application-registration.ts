import { DataSource, QueryRunner } from 'typeorm';

import { MARKETPLACE_FEATURED_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-featured-applications.constant';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const FEATURED_UNIVERSAL_IDENTIFIERS = MARKETPLACE_FEATURED_APPLICATIONS.map(
  (application) => application.universalIdentifier,
);

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
