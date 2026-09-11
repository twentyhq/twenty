import { DataSource } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const NO_INCOMING_WIDGET_OVERRIDES_PREDICATE = `NOT EXISTS (
  SELECT 1
  FROM "core"."pageLayoutWidget" incoming_widget
  WHERE incoming_widget."overrides"->>'pageLayoutTabId' = tab."id"::text
    AND incoming_widget."pageLayoutTabId" <> tab."id"
    AND incoming_widget."deletedAt" IS NULL
)`;

const ELIGIBLE_CANVAS_TABS_QUERY = `
  SELECT tab."id"
  FROM "core"."pageLayoutTab" tab
  JOIN "core"."pageLayoutWidget" widget
    ON widget."pageLayoutTabId" = tab."id"
  WHERE tab."layoutMode" = 'CANVAS'
    AND tab."deletedAt" IS NULL
    AND tab."workspaceId" = $1
    AND tab."applicationId" = $2
    AND ${NO_INCOMING_WIDGET_OVERRIDES_PREDICATE}
  GROUP BY tab."id"
  HAVING COUNT(widget."id") FILTER (
    WHERE widget."deletedAt" IS NULL
  ) = 1
    AND COUNT(widget."id") FILTER (
      WHERE widget."deletedAt" IS NULL
        AND widget."isActive" = true
        AND widget."applicationId" = $2
        AND (
          widget."position" IS NULL
          OR widget."position" = 'null'::jsonb
          OR widget."position"->>'layoutMode' = 'CANVAS'
        )
        AND (
          widget."overrides"->'position' IS NULL
          OR widget."overrides"->'position' = 'null'::jsonb
          OR widget."overrides"->'position'->>'layoutMode' = 'CANVAS'
        )
        AND (
          NOT COALESCE(widget."overrides" ? 'pageLayoutTabId', false)
          OR widget."overrides"->>'pageLayoutTabId' = tab."id"::text
        )
    ) = 1
`;

@RegisteredInstanceCommand('2.40.0', 1789139070588, { type: 'slow' })
export class MigrateCanvasTabsToVerticalListSlowInstanceCommand implements SlowInstanceCommand {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async runDataMigration(dataSource: DataSource): Promise<void> {
    // Manifest-owned tabs and widgets must stay compatible with future app syncs.
    const workspaces = (await dataSource.query(`
      SELECT "id", "workspaceCustomApplicationId"
      FROM "core"."workspace"
      WHERE "workspaceCustomApplicationId" IS NOT NULL
      ORDER BY "id"
    `)) as { id: string; workspaceCustomApplicationId: string }[];

    for (const workspace of workspaces) {
      await dataSource.query(
        `
        WITH eligible_tabs AS MATERIALIZED (
          ${ELIGIBLE_CANVAS_TABS_QUERY}
        ), migrated_widgets AS (
          UPDATE "core"."pageLayoutWidget" widget
          SET "position" = jsonb_build_object(
            'layoutMode', 'VERTICAL_LIST',
            'index', 0,
            'heightBehavior', 'TAB_VIEWPORT'
          ),
          "overrides" = CASE
            WHEN widget."overrides" ? 'position' THEN jsonb_set(
              widget."overrides",
              '{position}',
              jsonb_build_object(
                'layoutMode', 'VERTICAL_LIST',
                'index', 0,
                'heightBehavior', 'TAB_VIEWPORT'
              )
            )
            ELSE widget."overrides"
          END
          FROM eligible_tabs
          WHERE widget."pageLayoutTabId" = eligible_tabs."id"
            AND widget."deletedAt" IS NULL
          RETURNING widget."pageLayoutTabId"
        )
        UPDATE "core"."pageLayoutTab" tab
        SET "layoutMode" = 'VERTICAL_LIST'
        FROM migrated_widgets
        WHERE tab."id" = migrated_widgets."pageLayoutTabId"
        `,
        [workspace.id, workspace.workspaceCustomApplicationId],
      );

      // Flush even without eligible rows, in case an earlier attempt committed before its cache flush failed.
      await this.workspaceCacheService.flush(workspace.id, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    }
  }

  public async up(): Promise<void> {}

  public async down(): Promise<void> {}
}
