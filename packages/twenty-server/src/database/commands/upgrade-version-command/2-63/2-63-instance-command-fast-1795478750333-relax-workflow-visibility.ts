import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795478750333)
export class RelaxWorkflowVisibilityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VISIBILITY_CREATED_BY"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "visibility" DROP DEFAULT, ALTER COLUMN "visibility" DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "core"."workflow" SET "visibility" = CASE WHEN "isPrivate" THEN \'PRIVATE\' ELSE \'WORKSPACE\' END WHERE "visibility" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "visibility" SET DEFAULT \'WORKSPACE\', ALTER COLUMN "visibility" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_VISIBILITY_CREATED_BY" ON "core"."workflow" ("workspaceId", "visibility", "createdByUserWorkspaceId") ',
    );
  }
}
