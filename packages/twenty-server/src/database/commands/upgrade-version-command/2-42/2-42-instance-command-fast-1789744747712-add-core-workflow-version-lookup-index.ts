import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789744747712)
export class AddCoreWorkflowVersionLookupIndexFastInstanceCommand implements FastInstanceCommand {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX "IDX_WORKFLOW_VERSION_WORKSPACE_ID_CORE_WORKFLOW_ID" ON "core"."workflowVersion" ("workspaceId", "coreWorkflowId") ',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_WORKFLOW_VERSION_WORKSPACE_ID_CORE_WORKFLOW_ID"',
    );
  }
}
