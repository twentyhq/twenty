import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783603454480)
export class AddWorkflowVersionSyncableColumnsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" ADD COLUMN IF NOT EXISTS "universalIdentifier" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" ADD COLUMN IF NOT EXISTS "applicationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_c67a90cc29887078286205457e"
        ON "core"."workflowVersion" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        ALTER TABLE "core"."workflowVersion" ADD CONSTRAINT "FK_29f62766c5b109981244b97060d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_VERSION_APPLICATION_ID"
        ON "core"."workflowVersion" ("applicationId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" DROP CONSTRAINT IF EXISTS "FK_29f62766c5b109981244b97060d"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_c67a90cc29887078286205457e"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VERSION_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}
