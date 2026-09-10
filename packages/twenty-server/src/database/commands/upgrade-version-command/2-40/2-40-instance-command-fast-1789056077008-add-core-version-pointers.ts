import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.40.0', 1789056077008)
export class AddCoreVersionPointersFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "lastPublishedCoreVersionId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "coreWorkflowVersionId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP COLUMN "coreWorkflowVersionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflow" DROP COLUMN "lastPublishedCoreVersionId"`,
    );
  }
}
