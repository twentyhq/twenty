import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.2.0', 1795000003000, { type: 'slow' })
export class BackfillPageLayoutWidgetPositionAgainSlowInstanceCommand
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

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
