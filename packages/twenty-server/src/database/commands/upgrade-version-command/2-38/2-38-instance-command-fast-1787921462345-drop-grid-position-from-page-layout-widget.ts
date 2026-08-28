import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1787921462345)
export class DropGridPositionFromPageLayoutWidgetFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN IF EXISTS "gridPosition"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD COLUMN IF NOT EXISTS "gridPosition" jsonb`,
    );
    await queryRunner.query(
      `UPDATE "core"."pageLayoutWidget" SET "gridPosition" = '{}'::jsonb WHERE "gridPosition" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "gridPosition" SET NOT NULL`,
    );
  }
}
