import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Registrations published before version records existed only know their
// latest version. That snapshot becomes the first record of each registration
// so installations made from it can refer to a version id; its checksum stays
// null because the artifact was never fingerprinted at publish time, and npm
// registrations carry no publishing workspace since the registry is their
// publisher.
@RegisteredInstanceCommand('2.47.0', 1791840744304, { type: 'slow' })
export class BackfillApplicationRegistrationVersionsSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `INSERT INTO "core"."applicationRegistrationVersion"
         ("applicationRegistrationId", "version", "sourceType", "sourcePackage",
          "tarballFileId", "publishedByWorkspaceId", "publishedAt")
       SELECT "id", "latestAvailableVersion", "sourceType", "sourcePackage",
              "tarballFileId",
              CASE WHEN "sourceType" = 'tarball' THEN "workspaceId" END,
              "updatedAt"
       FROM "core"."applicationRegistration"
       WHERE "deletedAt" IS NULL
         AND "latestAvailableVersion" IS NOT NULL
         AND "sourceType" IN ('npm', 'tarball')
       ON CONFLICT ("applicationRegistrationId", "version") DO NOTHING`,
    );

    await dataSource.query(
      `UPDATE "core"."application" AS "application"
       SET "applicationRegistrationVersionId" = "version"."id"
       FROM "core"."applicationRegistrationVersion" AS "version"
       WHERE "application"."applicationRegistrationVersionId" IS NULL
         AND "application"."applicationRegistrationId" = "version"."applicationRegistrationId"
         AND "application"."version" = "version"."version"`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // The rows above describe versions that were really published; dropping
  // them would lose that history, so there is nothing to undo.
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
