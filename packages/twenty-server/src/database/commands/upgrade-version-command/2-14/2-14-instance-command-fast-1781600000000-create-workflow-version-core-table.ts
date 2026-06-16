import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.14.0', 1781600000000)
export class CreateWorkflowVersionCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."workflowVersion_status_enum" AS ENUM ('DRAFT', 'ACTIVE', 'DEACTIVATED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."workflowVersion" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "name" character varying,
        "triggers" jsonb,
        "steps" jsonb,
        "status" "core"."workflowVersion_status_enum" NOT NULL DEFAULT 'DRAFT',
        "position" double precision NOT NULL DEFAULT 0,
        "workflowId" uuid NOT NULL,
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_workflowVersion_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_workflowVersion_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_VERSION_WORKSPACE_ID"
        ON "core"."workflowVersion" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_VERSION_WORKFLOW_ID_DELETED_AT"
        ON "core"."workflowVersion" ("workflowId", "deletedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."workflowVersion"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."workflowVersion_status_enum"`,
    );
  }
}
