import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Being listed now means the app passed the marketplace review; isVetted is dropped one release later
@RegisteredInstanceCommand('2.54.0', 1793266191219, { type: 'slow' })
export class UnlistUnreviewedApplicationRegistrationsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET "isListed" = false
       WHERE "isListed" = true
         AND "isVetted" = false`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Not reverted: unlisted rows cannot be told apart from ones an admin unlisted
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
