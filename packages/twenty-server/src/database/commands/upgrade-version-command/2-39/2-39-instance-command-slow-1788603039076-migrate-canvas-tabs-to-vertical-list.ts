import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

type AmbiguousCanvasTabCount = {
  ambiguousTabCount: string;
};

const CREATE_MIGRATION_BACKUP_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS "core"."canvasTabToVerticalListMigrationBackup" (
    "pageLayoutTabId" uuid PRIMARY KEY,
    "pageLayoutWidgetId" uuid NOT NULL UNIQUE,
    "pageLayoutWidgetPosition" jsonb,
    "pageLayoutWidgetPositionOverride" jsonb,
    "pageLayoutWidgetPositionOverrideWasMigrated" boolean NOT NULL
  );

  ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
    ADD COLUMN IF NOT EXISTS "pageLayoutWidgetPositionOverride" jsonb;

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

@RegisteredInstanceCommand('2.39.0', 1788603039076, { type: 'slow' })
export class MigrateCanvasTabsToVerticalListSlowInstanceCommand implements SlowInstanceCommand {
  private readonly logger = new Logger(
    MigrateCanvasTabsToVerticalListSlowInstanceCommand.name,
  );

  public async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(CREATE_MIGRATION_BACKUP_TABLE_QUERY);

    const [ambiguousCanvasTabCount] = (await dataSource.query(`
      SELECT COUNT(*)::text AS "ambiguousTabCount"
      FROM (
        SELECT tab."id"
        FROM "core"."pageLayoutTab" tab
        LEFT JOIN "core"."pageLayoutWidget" widget
          ON widget."pageLayoutTabId" = tab."id"
        WHERE tab."layoutMode" = 'CANVAS'
          AND tab."deletedAt" IS NULL
        GROUP BY tab."id"
        HAVING COUNT(widget."id") FILTER (
          WHERE widget."deletedAt" IS NULL
        ) <> 1
          OR COUNT(widget."id") FILTER (
            WHERE widget."deletedAt" IS NULL
              AND widget."isActive" = true
          ) <> 1
      ) ambiguous_tabs
    `)) as AmbiguousCanvasTabCount[];

    if (Number(ambiguousCanvasTabCount?.ambiguousTabCount ?? 0) > 0) {
      this.logger.warn(
        `Leaving ${ambiguousCanvasTabCount.ambiguousTabCount} empty, inactive, or multi-widget Canvas tab(s) unchanged`,
      );
    }

    await dataSource.query(`
      WITH eligible_tabs AS MATERIALIZED (
        SELECT tab."id"
        FROM "core"."pageLayoutTab" tab
        JOIN "core"."pageLayoutWidget" widget
          ON widget."pageLayoutTabId" = tab."id"
        WHERE tab."layoutMode" = 'CANVAS'
          AND tab."deletedAt" IS NULL
        GROUP BY tab."id"
        HAVING COUNT(widget."id") FILTER (
          WHERE widget."deletedAt" IS NULL
        ) = 1
          AND COUNT(widget."id") FILTER (
            WHERE widget."deletedAt" IS NULL
              AND widget."isActive" = true
          ) = 1
      ), eligible_widgets AS (
        SELECT
          eligible_tabs."id" AS "pageLayoutTabId",
          widget."id" AS "pageLayoutWidgetId",
          widget."position" AS "pageLayoutWidgetPosition",
          widget."overrides"->'position' AS "pageLayoutWidgetPositionOverride",
          COALESCE(
            COALESCE(widget."overrides" ? 'position', false)
              AND (
                NOT COALESCE(widget."overrides" ? 'pageLayoutTabId', false)
                OR widget."overrides"->>'pageLayoutTabId' = widget."pageLayoutTabId"::text
              ),
            false
          ) AS "pageLayoutWidgetPositionOverrideWasMigrated"
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
          "pageLayoutWidgetPositionOverrideWasMigrated"
        )
        SELECT
          "pageLayoutTabId",
          "pageLayoutWidgetId",
          "pageLayoutWidgetPosition",
          "pageLayoutWidgetPositionOverride",
          "pageLayoutWidgetPositionOverrideWasMigrated"
        FROM eligible_widgets
        ON CONFLICT ("pageLayoutTabId") DO NOTHING
        RETURNING "pageLayoutTabId", "pageLayoutWidgetId"
      ), widgets_to_migrate AS (
        SELECT
          eligible_widgets."pageLayoutTabId",
          eligible_widgets."pageLayoutWidgetId",
          eligible_widgets."pageLayoutWidgetPositionOverrideWasMigrated"
        FROM eligible_widgets
        WHERE eligible_widgets."pageLayoutTabId" IN (
          SELECT "pageLayoutTabId" FROM backed_up_widgets
        ) OR EXISTS (
          SELECT 1
          FROM "core"."canvasTabToVerticalListMigrationBackup" backup
          WHERE backup."pageLayoutTabId" = eligible_widgets."pageLayoutTabId"
            AND backup."pageLayoutWidgetId" = eligible_widgets."pageLayoutWidgetId"
        )
      ), migrated_widgets AS (
        UPDATE "core"."pageLayoutWidget" widget
        SET "position" = jsonb_build_object(
          'layoutMode', 'VERTICAL_LIST',
          'index', 0,
          'heightBehavior', 'TAB_VIEWPORT'
        ),
        "overrides" = CASE
          WHEN widgets_to_migrate."pageLayoutWidgetPositionOverrideWasMigrated" THEN jsonb_set(
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
        FROM widgets_to_migrate
        WHERE widget."id" = widgets_to_migrate."pageLayoutWidgetId"
        RETURNING widget."pageLayoutTabId"
      )
      UPDATE "core"."pageLayoutTab" tab
      SET "layoutMode" = 'VERTICAL_LIST'
      FROM migrated_widgets
      WHERE tab."id" = migrated_widgets."pageLayoutTabId"
    `);
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
        WHERE tab."layoutMode" = 'VERTICAL_LIST'
          AND tab."deletedAt" IS NULL
          AND widget."deletedAt" IS NULL
          AND widget."isActive" = true
          AND widget."position" = jsonb_build_object(
            'layoutMode', 'VERTICAL_LIST',
            'index', 0,
            'heightBehavior', 'TAB_VIEWPORT'
          )
          AND CASE
            WHEN backup."pageLayoutWidgetPositionOverrideWasMigrated" THEN
              widget."overrides"->'position' = jsonb_build_object(
                'layoutMode', 'VERTICAL_LIST',
                'index', 0,
                'heightBehavior', 'TAB_VIEWPORT'
              )
            ELSE true
          END
          AND (
            SELECT COUNT(*)
            FROM "core"."pageLayoutWidget" sibling
            WHERE sibling."pageLayoutTabId" = tab."id"
              AND sibling."deletedAt" IS NULL
          ) = 1
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
        RETURNING widget."pageLayoutTabId"
      )
      UPDATE "core"."pageLayoutTab" tab
      SET "layoutMode" = 'CANVAS'
      FROM restored_widgets
      WHERE tab."id" = restored_widgets."pageLayoutTabId"
    `);

    await queryRunner.query(
      `DROP TABLE "core"."canvasTabToVerticalListMigrationBackup"`,
    );
  }
}
