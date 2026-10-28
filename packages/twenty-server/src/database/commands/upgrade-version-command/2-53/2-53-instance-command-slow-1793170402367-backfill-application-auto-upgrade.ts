import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793170402367, { type: 'slow' })
export class BackfillApplicationAutoUpgradeSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."application" AS application
       SET "autoUpgrade" = true
       FROM "core"."applicationRegistration" AS registration
       WHERE application."applicationRegistrationId" = registration.id
         AND registration."isVetted" = true
         AND application."autoUpgrade" = false`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Not reverted: opted-out rows cannot be told apart from backfilled ones
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
