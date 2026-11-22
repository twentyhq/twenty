import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.62.0', 1795368198117)
export class AddWorkflowIsPrivateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD "isPrivate" boolean',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "isPrivate" TYPE boolean USING ("visibility" = \'PRIVATE\')',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "isPrivate" SET DEFAULT false, ALTER COLUMN "isPrivate" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_WORKFLOW_IS_PRIVATE_CREATED_BY" ON "core"."workflow" ("workspaceId", "isPrivate", "createdByUserWorkspaceId") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_WORKFLOW_IS_PRIVATE_CREATED_BY"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" DROP COLUMN "isPrivate"',
    );
  }
}
