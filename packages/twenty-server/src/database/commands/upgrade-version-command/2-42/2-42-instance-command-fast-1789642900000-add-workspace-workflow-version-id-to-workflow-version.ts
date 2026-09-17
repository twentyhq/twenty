import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789642900000)
export class AddWorkspaceWorkflowVersionIdToWorkflowVersionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" ADD COLUMN IF NOT EXISTS "workspaceWorkflowVersionId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_VERSION_WORKSPACE_WORKFLOW_VERSION_ID" ON "core"."workflowVersion" ("workspaceId", "workspaceWorkflowVersionId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VERSION_WORKSPACE_WORKFLOW_VERSION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" DROP COLUMN IF EXISTS "workspaceWorkflowVersionId"`,
    );
  }
}
