import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.21.0', 1775129420309)
export class AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_VIEW_FIELD_GROUP_ID" ON "core"."viewField" ("viewFieldGroupId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_VIEW_FIELD_GROUP_ID"`,
    );
  }
}
