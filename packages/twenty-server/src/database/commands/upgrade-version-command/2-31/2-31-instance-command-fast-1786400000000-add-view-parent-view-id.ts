import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.31.0', 1786400000000)
export class AddViewParentViewIdFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "parentViewId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_VIEW_PARENT_VIEW_ID" ON "core"."view" ("parentViewId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_PARENT_VIEW_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "parentViewId"`,
    );
  }
}
