import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789580000000)
export class AddWorkspaceWorkflowVersionIdToWorkflowVersionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" ADD COLUMN IF NOT EXISTS "workspaceWorkflowVersionId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_WORKFLOW_VERSION_WORKSPACE_VERSION_ID" ON "core"."workflowVersion" ("workspaceId", "workspaceWorkflowVersionId") WHERE "workspaceWorkflowVersionId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VERSION_WORKSPACE_VERSION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" DROP COLUMN "workspaceWorkflowVersionId"`,
    );
  }
}
