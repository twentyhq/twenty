import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationEntityAndRelationships1757491357122
  implements MigrationInterface
{
  name = 'AddApplicationEntityAndRelationships1757491357122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "FK_ROLE_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_OBJECT_METADATA_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "FK_INDEX_METADATA_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_APPLICATION_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_AGENT_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_CRON_TRIGGER_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_DATABASE_EVENT_TRIGGER_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_SERVERLESS_FUNCTION_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_PAGE_LAYOUT_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_LABEL_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "CHK_APPLICATION_GIT_REPOSITORY_URL"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "CHK_APPLICATION_LOCAL_SOURCE_PATH"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "icon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "repositoryUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "standardId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "label" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "version" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "sourceType"`,
    );
    await queryRunner.query(`DROP TYPE "core"."application_sourcetype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "sourceType" text NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "sourcePath"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "sourcePath" text NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE" ON "core"."application" ("standardId", "workspaceId") WHERE "deletedAt" IS NULL AND "standardId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_08d1d5e33c2a3ce7c140e9b335b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_08d1d5e33c2a3ce7c140e9b335b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "sourcePath"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "sourcePath" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "sourceType"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."application_sourcetype_enum" AS ENUM('git', 'local', 'marketplace')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "sourceType" "core"."application_sourcetype_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "version" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "label" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "standardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "repositoryUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "icon" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "universalIdentifier" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "CHK_APPLICATION_LOCAL_SOURCE_PATH" CHECK ((("sourceType" <> 'local'::core.application_sourcetype_enum) OR ("sourcePath" IS NOT NULL)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "CHK_APPLICATION_GIT_REPOSITORY_URL" CHECK ((("sourceType" <> 'git'::core.application_sourcetype_enum) OR ("repositoryUrl" IS NOT NULL)))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_LABEL_WORKSPACE_ID_UNIQUE" ON "core"."application" ("label", "workspaceId") WHERE ("deletedAt" IS NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_PAGE_LAYOUT_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_SERVERLESS_FUNCTION_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_DATABASE_EVENT_TRIGGER_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_CRON_TRIGGER_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_AGENT_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_APPLICATION_WORKSPACE_ID" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "FK_INDEX_METADATA_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_OBJECT_METADATA_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "FK_ROLE_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
