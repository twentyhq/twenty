import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImportJobEntity1774300000000 implements MigrationInterface {
  name = 'AddImportJobEntity1774300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "core"."importJob_status_enum" AS ENUM (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."importJob" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "workspaceMemberId" uuid,
        "objectNameSingular" text NOT NULL,
        "fileName" text,
        "columnMappings" jsonb,
        "validatedRows" jsonb,
        "status" "core"."importJob_status_enum" NOT NULL DEFAULT 'pending',
        "totalRecords" integer NOT NULL DEFAULT 0,
        "processedRecords" integer NOT NULL DEFAULT 0,
        "successCount" integer NOT NULL DEFAULT 0,
        "warningCount" integer NOT NULL DEFAULT 0,
        "failureCount" integer NOT NULL DEFAULT 0,
        "result" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_import_job_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_import_job_workspace" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_IMPORT_JOB_WORKSPACE_STATUS"
        ON "core"."importJob" ("workspaceId", "status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_IMPORT_JOB_WORKSPACE_STATUS";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."importJob";`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."importJob_status_enum";`,
    );
  }
}
