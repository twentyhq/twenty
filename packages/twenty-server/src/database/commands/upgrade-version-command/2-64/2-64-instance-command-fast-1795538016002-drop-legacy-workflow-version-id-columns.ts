import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.64.0', 1795538016002)
export class DropLegacyWorkflowVersionIdColumnsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VERSION_WORKSPACE_VERSION_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflowVersion" DROP COLUMN IF EXISTS "workspaceWorkflowVersionId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" DROP COLUMN IF EXISTS "lastPublishedVersionId"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "lastPublishedVersionId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflowVersion" ADD COLUMN IF NOT EXISTS "workspaceWorkflowVersionId" uuid',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_WORKFLOW_VERSION_WORKSPACE_VERSION_ID" ON "core"."workflowVersion" ("workspaceId", "workspaceWorkflowVersionId") WHERE "workspaceWorkflowVersionId" IS NOT NULL',
    );
  }
}
