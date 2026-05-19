import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.5.0', 1778502963794)
export class AddSubFieldNameToViewSortFastInstanceCommand
  implements FastInstanceCommand
{
  // Idempotent so it can coexist with the early 2.3 instance command
  // `1747234200000-add-sub-field-name-to-view-sort` (see that file for context).
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD COLUMN IF NOT EXISTS "subFieldName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP COLUMN IF EXISTS "subFieldName"`,
    );
  }
}
