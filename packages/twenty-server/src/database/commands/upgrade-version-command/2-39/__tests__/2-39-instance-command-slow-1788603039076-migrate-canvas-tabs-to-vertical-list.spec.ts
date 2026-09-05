import { type DataSource, type QueryRunner } from 'typeorm';

import { MigrateCanvasTabsToVerticalListSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-instance-command-slow-1788603039076-migrate-canvas-tabs-to-vertical-list';

describe('MigrateCanvasTabsToVerticalListSlowInstanceCommand', () => {
  const command = new MigrateCanvasTabsToVerticalListSlowInstanceCommand();

  it('migrates only unambiguous single-widget Canvas tabs', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ambiguousTabCount: '2' }])
      .mockResolvedValueOnce([]);

    await command.runDataMigration({ query } as unknown as DataSource);

    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[0][0]).toContain(
      `CREATE TABLE IF NOT EXISTS "core"."canvasTabToVerticalListMigrationBackup"`,
    );
    expect(query.mock.calls[0][0]).toContain(
      `ADD COLUMN IF NOT EXISTS "pageLayoutWidgetPositionOverride" jsonb`,
    );
    expect(query.mock.calls[0][0]).toContain(
      `ADD COLUMN IF NOT EXISTS "pageLayoutWidgetPositionOverrideWasMigrated" boolean`,
    );
    expect(query.mock.calls[0][0]).toContain(
      `ALTER COLUMN "pageLayoutWidgetPositionOverrideWasMigrated" SET NOT NULL`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `COUNT(widget."id") FILTER (
          WHERE widget."deletedAt" IS NULL
        ) = 1`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `'heightBehavior', 'TAB_VIEWPORT'`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `widget."overrides"->'position' AS "pageLayoutWidgetPositionOverride"`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `WHEN widgets_to_migrate."pageLayoutWidgetPositionOverrideWasMigrated"`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `widget."overrides"->>'pageLayoutTabId' = widget."pageLayoutTabId"::text`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `false
          ) AS "pageLayoutWidgetPositionOverrideWasMigrated"`,
    );
    expect(query.mock.calls[2][0]).toContain(
      `SET "layoutMode" = 'VERTICAL_LIST'`,
    );
  });

  it('restores only backed-up Canvas data on downgrade', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await command.down({ query } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain(
      `FROM "core"."canvasTabToVerticalListMigrationBackup" backup`,
    );
    expect(query.mock.calls[0][0]).toContain(
      `SET "position" = widgets_to_restore."pageLayoutWidgetPosition"`,
    );
    expect(query.mock.calls[0][0]).toContain(
      `widgets_to_restore."pageLayoutWidgetPositionOverride"`,
    );
    expect(query.mock.calls[0][0]).toContain(`SET "layoutMode" = 'CANVAS'`);
    expect(query.mock.calls[1][0]).toContain(
      `DROP TABLE "core"."canvasTabToVerticalListMigrationBackup"`,
    );
  });
});
