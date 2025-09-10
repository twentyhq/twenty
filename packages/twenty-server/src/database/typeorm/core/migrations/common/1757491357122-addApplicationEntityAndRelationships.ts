import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationEntityAndRelationships1757491357122
  implements MigrationInterface
{
  name = 'AddApplicationEntityAndRelationships1757491357122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."application" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "standardId" uuid,
        "label" text NOT NULL,
        "description" text,
        "version" text,
        "sourceType" text NOT NULL DEFAULT 'local',
        "sourcePath" text NOT NULL,
        "workspaceId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_APPLICATION_WORKSPACE_ID" ON "core"."application" ("workspaceId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE" 
      ON "core"."application" ("standardId", "workspaceId") 
      WHERE "deletedAt" IS NULL AND "standardId" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."application" 
      ADD CONSTRAINT "FK_08d1d5e33c2a3ce7c140e9b335b" 
      FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."agent" 
      ADD COLUMN IF NOT EXISTS "applicationId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."agent" 
      ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" 
      FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."agent" DROP CONSTRAINT IF EXISTS "FK_259c48f99f625708723414adb5d"
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."application" DROP CONSTRAINT IF EXISTS "FK_08d1d5e33c2a3ce7c140e9b335b"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "core"."IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "core"."IDX_APPLICATION_WORKSPACE_ID"
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."agent" DROP COLUMN IF EXISTS "applicationId"
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "core"."application"`);
  }
}
