import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.48.0', 1792144523838, { type: 'slow' })
export class AddApplicationRegistrationStatsIndexSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_APPLICATION_REGISTRATION_ID_ID" ON "core"."application" ("applicationRegistrationId", "id") WHERE "deletedAt" IS NULL AND "applicationRegistrationId" IS NOT NULL',
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_APPLICATION_REGISTRATION_ID_ID" ON "core"."application" ("applicationRegistrationId", "id") WHERE "deletedAt" IS NULL AND "applicationRegistrationId" IS NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "core"."IDX_APPLICATION_REGISTRATION_ID_ID"');
  }
}
