import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789370101008)
export class AddCoreVersionPointersFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "lastPublishedCoreWorkflowVersionId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "coreWorkflowVersionId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP COLUMN IF EXISTS "coreWorkflowVersionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflow" DROP COLUMN IF EXISTS "lastPublishedCoreWorkflowVersionId"`,
    );
  }
}
