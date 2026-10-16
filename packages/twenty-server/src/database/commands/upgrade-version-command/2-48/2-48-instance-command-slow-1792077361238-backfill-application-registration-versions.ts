import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.48.0', 1792077361238, { type: 'slow' })
export class BackfillApplicationRegistrationVersionsSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `INSERT INTO "core"."applicationRegistrationVersion"
         ("applicationRegistrationId", "version", "sourceType", "sourcePackage",
          "tarballFileId", "publishedAt")
       SELECT "id", "latestAvailableVersion", "sourceType", "sourcePackage",
              "tarballFileId",
              "updatedAt"
       FROM "core"."applicationRegistration"
       WHERE "deletedAt" IS NULL
         AND "latestAvailableVersion" IS NOT NULL
         AND "sourceType" IN ('npm', 'tarball')
       ON CONFLICT ("applicationRegistrationId", "version") DO NOTHING`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
