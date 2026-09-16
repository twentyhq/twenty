import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789566000000)
export class RelinkWorkflowVersionsToCoreWorkflowsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."workflowVersion" v
       SET "coreWorkflowId" = c."id"
       FROM "core"."workflow" c
       WHERE v."coreWorkflowId" IS NULL
         AND c."workspaceId" = v."workspaceId"
         AND c."workspaceWorkflowId" = v."workflowId"`,
    );
  }

  public async down(): Promise<void> {}
}
