import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.37.0', 1787838153752, { type: 'slow' })
export class BackfillMissingPageLayoutWidgetPositionsSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      WITH missing_positions AS (
        SELECT widget."id",
          CASE tab."layoutMode"
            WHEN 'CANVAS' THEN jsonb_build_object('layoutMode', 'CANVAS')
            WHEN 'VERTICAL_LIST' THEN jsonb_build_object(
              'layoutMode', 'VERTICAL_LIST',
              'index', COALESCE((
                SELECT MAX((existing."position"->>'index')::integer) + 1
                FROM "core"."pageLayoutWidget" existing
                WHERE existing."pageLayoutTabId" = widget."pageLayoutTabId"
                  AND existing."position"->>'layoutMode' = 'VERTICAL_LIST'
              ), 0) + ROW_NUMBER() OVER (
                PARTITION BY widget."pageLayoutTabId"
                ORDER BY (widget."gridPosition"->>'row')::integer,
                  (widget."gridPosition"->>'column')::integer,
                  widget."createdAt", widget."id"
              ) - 1
            )
            ELSE COALESCE(
              widget."gridPosition",
              '{"row": 0, "column": 0, "rowSpan": 1, "columnSpan": 12}'::jsonb
            ) || jsonb_build_object('layoutMode', 'GRID')
          END AS "position"
        FROM "core"."pageLayoutWidget" widget
        JOIN "core"."pageLayoutTab" tab ON tab."id" = widget."pageLayoutTabId"
        WHERE widget."position" IS NULL
      )
      UPDATE "core"."pageLayoutWidget" widget
      SET "position" = missing_positions."position"
      FROM missing_positions
      WHERE widget."id" = missing_positions."id"
    `);
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
