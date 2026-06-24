import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// INTENTIONALLY BROKEN — verification only, must never merge.
// Runs invalid SQL against a non-existent table so the upgrade step fails,
// proving the cross-version upgrade CI catches a broken upgrade.
@RegisteredInstanceCommand('2.16.0', 1782999999999)
export class CiBreakCrossVersionUpgradeFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."this_table_does_not_exist_ci_break" ADD "x" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."this_table_does_not_exist_ci_break" DROP COLUMN "x"',
    );
  }
}
