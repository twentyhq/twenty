import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type AmbiguousCanvasTabCount = {
  ambiguousTabCount: string;
};

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
    AND ${NO_INCOMING_WIDGET_OVERRIDES_PREDICATE}
  GROUP BY tab."id"
  HAVING COUNT(widget."id") FILTER (
    WHERE widget."deletedAt" IS NULL
  ) = 1
    AND COUNT(widget."id") FILTER (
      WHERE widget."deletedAt" IS NULL
        AND widget."isActive" = true
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

const CREATE_MIGRATION_BACKUP_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS "core"."canvasTabToVerticalListMigrationBackup" (
    "pageLayoutTabId" uuid PRIMARY KEY,
    "pageLayoutWidgetId" uuid NOT NULL UNIQUE,
    "pageLayoutWidgetPosition" jsonb,
    "pageLayoutWidgetPositionOverride" jsonb,
    "pageLayoutWidgetTabOverride" jsonb,
    "pageLayoutWidgetTabOverrideWasBackedUp" boolean NOT NULL DEFAULT false,
    "pageLayoutWidgetPositionOverrideWasMigrated" boolean NOT NULL
  );

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ADD COLUMN IF NOT EXISTS "pageLayoutWidgetPositionOverride" jsonb;

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ADD COLUMN IF NOT EXISTS "pageLayoutWidgetTabOverride" jsonb;

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ADD COLUMN IF NOT EXISTS "pageLayoutWidgetTabOverrideWasBackedUp" boolean NOT NULL DEFAULT false;

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ADD COLUMN IF NOT EXISTS "pageLayoutWidgetPositionOverrideWasMigrated" boolean;

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ALTER COLUMN "pageLayoutWidgetPositionOverrideWasMigrated" SET DEFAULT false;

  UPDATE "core"."canvasTabToVerticalListMigrationBackup"
  SET "pageLayoutWidgetPositionOverrideWasMigrated" = false
  WHERE "pageLayoutWidgetPositionOverrideWasMigrated" IS NULL;

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ALTER COLUMN "pageLayoutWidgetPositionOverrideWasMigrated" SET NOT NULL;
`;

@RegisteredInstanceCommand('2.39.0', 1788770678957, { type: 'slow' })
export class MigrateCanvasTabsToVerticalListSlowInstanceCommand implements SlowInstanceCommand {
  private readonly logger = new Logger(
    MigrateCanvasTabsToVerticalListSlowInstanceCommand.name,
  );

  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(CREATE_MIGRATION_BACKUP_TABLE_QUERY);

    const [ambiguousCanvasTabCount] = (await dataSource.query(`
      SELECT COUNT(*)::text AS "ambiguousTabCount"
      FROM "core"."pageLayoutTab" tab
      WHERE tab."layoutMode" = 'CANVAS'
        AND tab."deletedAt" IS NULL
        AND tab."id" NOT IN (${ELIGIBLE_CANVAS_TABS_QUERY})
    `)) as AmbiguousCanvasTabCount[];

    if (Number(ambiguousCanvasTabCount?.ambiguousTabCount ?? 0) > 0) {
      this.logger.warn(
        `Leaving ${ambiguousCanvasTabCount.ambiguousTabCount} Canvas tab(s) with ambiguous widget placement unchanged`,
      );
    }

    // Backups and row updates commit atomically, so retries must not remigrate backed-up widgets.
    await dataSource.query(`
      WITH eligible_tabs AS MATERIALIZED (
        ${ELIGIBLE_CANVAS_TABS_QUERY}
      ), eligible_widgets AS (
        SELECT
          eligible_tabs."id" AS "pageLayoutTabId",
          widget."id" AS "pageLayoutWidgetId",
          widget."position" AS "pageLayoutWidgetPosition",
          widget."overrides"->'position' AS "pageLayoutWidgetPositionOverride",
          widget."overrides"->'pageLayoutTabId' AS "pageLayoutWidgetTabOverride",
          COALESCE(widget."overrides" ? 'position', false)
            AS "pageLayoutWidgetPositionOverrideWasMigrated"
        FROM eligible_tabs
        JOIN "core"."pageLayoutWidget" widget
          ON widget."pageLayoutTabId" = eligible_tabs."id"
          AND widget."deletedAt" IS NULL
      ), backed_up_widgets AS (
        INSERT INTO "core"."canvasTabToVerticalListMigrationBackup" (
          "pageLayoutTabId",
          "pageLayoutWidgetId",
          "pageLayoutWidgetPosition",
          "pageLayoutWidgetPositionOverride",
          "pageLayoutWidgetTabOverride",
          "pageLayoutWidgetTabOverrideWasBackedUp",
          "pageLayoutWidgetPositionOverrideWasMigrated"
        )
        SELECT
          "pageLayoutTabId",
          "pageLayoutWidgetId",
          "pageLayoutWidgetPosition",
          "pageLayoutWidgetPositionOverride",
          "pageLayoutWidgetTabOverride",
          true,
          "pageLayoutWidgetPositionOverrideWasMigrated"
        FROM eligible_widgets
        ON CONFLICT DO NOTHING
        RETURNING "pageLayoutWidgetId", "pageLayoutWidgetPositionOverrideWasMigrated"
      ), migrated_widgets AS (
        UPDATE "core"."pageLayoutWidget" widget
        SET "position" = jsonb_build_object(
          'layoutMode', 'VERTICAL_LIST',
          'index', 0,
          'heightBehavior', 'TAB_VIEWPORT'
        ),
        "overrides" = CASE
          WHEN backed_up_widgets."pageLayoutWidgetPositionOverrideWasMigrated" THEN jsonb_set(
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
        FROM backed_up_widgets
        WHERE widget."id" = backed_up_widgets."pageLayoutWidgetId"
        RETURNING widget."pageLayoutTabId"
      )
      UPDATE "core"."pageLayoutTab" tab
      SET "layoutMode" = 'VERTICAL_LIST'
      FROM migrated_widgets
      WHERE tab."id" = migrated_widgets."pageLayoutTabId"
    `);

    await this.flushPageLayoutCaches(dataSource);
  }

  private async flushPageLayoutCaches(
    dataSource: DataSource | QueryRunner,
  ): Promise<void> {
    // Backups retain the affected workspaces if a previous cache flush failed.
    const workspaces = (await dataSource.query(`
      SELECT DISTINCT tab."workspaceId"
      FROM "core"."canvasTabToVerticalListMigrationBackup" backup
      JOIN "core"."pageLayoutTab" tab
        ON tab."id" = backup."pageLayoutTabId"
    `)) as { workspaceId: string }[];

    for (const { workspaceId } of workspaces) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(CREATE_MIGRATION_BACKUP_TABLE_QUERY);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH widgets_to_restore AS MATERIALIZED (
        SELECT
          backup."pageLayoutTabId",
          backup."pageLayoutWidgetId",
          backup."pageLayoutWidgetPosition",
          backup."pageLayoutWidgetPositionOverride",
          backup."pageLayoutWidgetPositionOverrideWasMigrated"
        FROM "core"."canvasTabToVerticalListMigrationBackup" backup
        JOIN "core"."pageLayoutTab" tab
          ON tab."id" = backup."pageLayoutTabId"
        JOIN "core"."pageLayoutWidget" widget
          ON widget."id" = backup."pageLayoutWidgetId"
          AND widget."pageLayoutTabId" = backup."pageLayoutTabId"
        WHERE tab."layoutMode" = 'VERTICAL_LIST'
          AND tab."deletedAt" IS NULL
          AND widget."deletedAt" IS NULL
          AND widget."isActive" = true
          AND widget."position" = jsonb_build_object(
            'layoutMode', 'VERTICAL_LIST',
            'index', 0,
            'heightBehavior', 'TAB_VIEWPORT'
          )
          AND backup."pageLayoutWidgetTabOverrideWasBackedUp"
          AND widget."overrides"->'pageLayoutTabId' IS NOT DISTINCT FROM
            backup."pageLayoutWidgetTabOverride"
          AND CASE
            WHEN backup."pageLayoutWidgetPositionOverrideWasMigrated" THEN
              widget."overrides"->'position' = jsonb_build_object(
                'layoutMode', 'VERTICAL_LIST',
                'index', 0,
                'heightBehavior', 'TAB_VIEWPORT'
              )
            ELSE widget."overrides"->'position' IS NOT DISTINCT FROM
              backup."pageLayoutWidgetPositionOverride"
          END
          AND (
            SELECT COUNT(*)
            FROM "core"."pageLayoutWidget" sibling
            WHERE sibling."pageLayoutTabId" = tab."id"
              AND sibling."deletedAt" IS NULL
          ) = 1
          AND ${NO_INCOMING_WIDGET_OVERRIDES_PREDICATE}
      ), restored_widgets AS (
        UPDATE "core"."pageLayoutWidget" widget
        SET "position" = widgets_to_restore."pageLayoutWidgetPosition",
        "overrides" = CASE
          WHEN widgets_to_restore."pageLayoutWidgetPositionOverrideWasMigrated" THEN
            jsonb_set(
              widget."overrides",
              '{position}',
              widgets_to_restore."pageLayoutWidgetPositionOverride"
            )
          ELSE widget."overrides"
        END
        FROM widgets_to_restore
        WHERE widget."id" = widgets_to_restore."pageLayoutWidgetId"
        RETURNING widgets_to_restore."pageLayoutTabId"
      )
      UPDATE "core"."pageLayoutTab" tab
      SET "layoutMode" = 'CANVAS'
      FROM restored_widgets
      WHERE tab."id" = restored_widgets."pageLayoutTabId"
    `);

    await this.flushPageLayoutCaches(queryRunner);

    await queryRunner.query(
      `DROP TABLE "core"."canvasTabToVerticalListMigrationBackup"`,
    );
  }
}
