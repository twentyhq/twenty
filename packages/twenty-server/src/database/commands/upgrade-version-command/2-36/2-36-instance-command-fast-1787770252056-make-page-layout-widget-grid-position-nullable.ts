import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.36.0', 1787770252056)
export class MakePageLayoutWidgetGridPositionNullableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "gridPosition" DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "core"."pageLayoutWidget"
      SET "gridPosition" = CASE
        WHEN "position"->>'layoutMode' = 'GRID' THEN "position" - 'layoutMode'
        ELSE '{"row": 0, "column": 0, "rowSpan": 1, "columnSpan": 12}'::jsonb
      END
      WHERE "gridPosition" IS NULL
    `);
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "gridPosition" SET NOT NULL',
    );
  }
}
