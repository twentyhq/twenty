import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783634200000, { type: 'slow' })
export class MakePageLayoutWidgetPositionNotNullSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."pageLayoutWidget"
          SET "position" = jsonb_build_object(
            'layoutMode',  'GRID',
            'row',         "gridPosition"->'row',
            'column',      "gridPosition"->'column',
            'rowSpan',     "gridPosition"->'rowSpan',
            'columnSpan',  "gridPosition"->'columnSpan'
          )
        WHERE "position" IS NULL
          AND "gridPosition" IS NOT NULL`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "position" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "gridPosition" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."pageLayoutWidget"
          SET "gridPosition" = COALESCE(
            CASE
              WHEN "position"->>'layoutMode' = 'GRID'
              THEN jsonb_build_object(
                'row',        "position"->'row',
                'column',     "position"->'column',
                'rowSpan',    "position"->'rowSpan',
                'columnSpan', "position"->'columnSpan'
              )
            END,
            '{"row":0,"column":0,"rowSpan":1,"columnSpan":1}'::jsonb
          )
        WHERE "gridPosition" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "gridPosition" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "position" DROP NOT NULL`,
    );
  }
}
