import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationEntityAndRelationships1757364323932
  implements MigrationInterface
{
  name = 'AddApplicationEntityAndRelationships1757364323932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "core"."application_sourcetype_enum" AS ENUM('git', 'local', 'marketplace');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "core"."application" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "universalIdentifier" uuid NOT NULL,
                "label" character varying NOT NULL,
                "description" text,
                "icon" character varying,
                "repositoryUrl" character varying,
                "version" character varying,
                "sourceType" "core"."application_sourcetype_enum" NOT NULL,
                "sourcePath" character varying,
                "workspaceId" uuid NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_APPLICATION_GIT_REPOSITORY_URL" CHECK (("sourceType" != 'git') OR ("repositoryUrl" IS NOT NULL)),
                CONSTRAINT "CHK_APPLICATION_LOCAL_SOURCE_PATH" CHECK (("sourceType" != 'local') OR ("sourcePath" IS NOT NULL))
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_APPLICATION_WORKSPACE_ID" ON "core"."application" ("workspaceId")
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_APPLICATION_LABEL_WORKSPACE_ID_UNIQUE" ON "core"."application" ("label", "workspaceId") WHERE "deletedAt" IS NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."application" ADD CONSTRAINT "FK_APPLICATION_WORKSPACE_ID" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."agent" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."cronTrigger" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."databaseEventTrigger" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."indexMetadata" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."objectMetadata" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."pageLayout" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."role" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."serverlessFunction" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."view" ADD "applicationId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_AGENT_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_CRON_TRIGGER_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_DATABASE_EVENT_TRIGGER_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "FK_INDEX_METADATA_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_OBJECT_METADATA_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_PAGE_LAYOUT_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."role" ADD CONSTRAINT "FK_ROLE_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_SERVERLESS_FUNCTION_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_SERVERLESS_FUNCTION_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "FK_ROLE_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_PAGE_LAYOUT_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_OBJECT_METADATA_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "FK_INDEX_METADATA_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_DATABASE_EVENT_TRIGGER_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_CRON_TRIGGER_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_AGENT_APPLICATION_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN "applicationId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_APPLICATION_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_LABEL_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_APPLICATION_WORKSPACE_ID"`);

    await queryRunner.query(`DROP TABLE "core"."application"`);

    await queryRunner.query(`DROP TYPE "core"."application_sourcetype_enum"`);
  }
}
