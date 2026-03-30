import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportJobEntity1774400000000 implements MigrationInterface {
  name = 'AddExportJobEntity1774400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "core"."exportJob_status_enum" AS ENUM (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."exportJob" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "workspaceMemberId" uuid,
        "objectNameSingular" text NOT NULL,
        "filter" jsonb,
        "orderBy" jsonb,
        "columns" jsonb NOT NULL,
        "relationConfigs" jsonb,
        "format" text NOT NULL DEFAULT 'csv',
        "status" "core"."exportJob_status_enum" NOT NULL DEFAULT 'pending',
        "totalRecords" integer NOT NULL DEFAULT 0,
        "processedRecords" integer NOT NULL DEFAULT 0,
        "result" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_export_job_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_export_job_workspace" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_EXPORT_JOB_WORKSPACE_STATUS"
        ON "core"."exportJob" ("workspaceId", "status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_EXPORT_JOB_WORKSPACE_STATUS";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."exportJob";`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."exportJob_status_enum";`,
    );
  }
}
