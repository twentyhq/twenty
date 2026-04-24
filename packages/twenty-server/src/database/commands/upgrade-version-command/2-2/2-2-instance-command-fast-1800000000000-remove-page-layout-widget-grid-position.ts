import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.2.0', 1800000000000)
export class RemovePageLayoutWidgetGridPositionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "position" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "gridPosition"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "gridPosition" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "position" DROP NOT NULL`,
    );
  }
}
