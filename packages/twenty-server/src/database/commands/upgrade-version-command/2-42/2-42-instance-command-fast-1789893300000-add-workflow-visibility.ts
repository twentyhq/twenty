import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Existing workflows were authored before anyone could keep one to themselves,
// so they default to WORKSPACE: nobody loses sight of a workflow they had. They
// also have no owner, which is what lets the first member who makes one private
// claim it.
@RegisteredInstanceCommand('2.42.0', 1789893300000)
export class AddWorkflowVisibilityFastInstanceCommand
  implements FastInstanceCommand
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "visibility" varchar NOT NULL DEFAULT 'WORKSPACE'`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "createdByUserWorkspaceId" uuid NULL`,
    );

    await queryRunner.query(
      `DO $$
       BEGIN
         ALTER TABLE "core"."workflow"
           ADD CONSTRAINT "FK_WORKFLOW_CREATED_BY_USER_WORKSPACE"
           FOREIGN KEY ("createdByUserWorkspaceId")
           REFERENCES "core"."userWorkspace"("id") ON DELETE SET NULL;
       EXCEPTION
         WHEN duplicate_object THEN NULL;
       END $$`,
    );

    // The list query filters on both columns together for every reader, so the
    // index carries the visibility as well as the owner.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_VISIBILITY_CREATED_BY" ON "core"."workflow" ("workspaceId", "visibility", "createdByUserWorkspaceId")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VISIBILITY_CREATED_BY"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workflow" DROP CONSTRAINT IF EXISTS "FK_WORKFLOW_CREATED_BY_USER_WORKSPACE"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workflow" DROP COLUMN IF EXISTS "createdByUserWorkspaceId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workflow" DROP COLUMN IF EXISTS "visibility"`,
    );
  }
}
