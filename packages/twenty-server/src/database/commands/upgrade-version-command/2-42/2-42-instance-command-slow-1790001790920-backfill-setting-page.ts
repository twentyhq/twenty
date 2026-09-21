import { DataSource, QueryRunner } from 'typeorm';

import { getLegacySettingPageUniversalIdentifier } from 'twenty-shared/application';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

type LegacySettingsTabRow = {
  workspaceId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
  frontComponentId: string;
  frontComponentUniversalIdentifier: string;
};

// Inlined rather than imported from DEFAULT_SETTING_PAGE_* so this command keeps
// writing what it wrote the day it ran, whatever those constants become.
const LEGACY_SETTING_PAGE_TITLE = 'Settings';
const LEGACY_SETTING_PAGE_ICON = 'IconAdjustments';
const LEGACY_SETTING_PAGE_POSITION = 0;
const LEGACY_SETTING_PAGE_SCOPE = 'WORKSPACE';

@RegisteredInstanceCommand('2.42.0', 1790001790920, { type: 'slow' })
export class BackfillSettingPageSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const legacySettingsTabRows: LegacySettingsTabRow[] =
      await dataSource.query(`
        SELECT
          application."workspaceId" AS "workspaceId",
          application."id" AS "applicationId",
          application."universalIdentifier" AS "applicationUniversalIdentifier",
          "frontComponent"."id" AS "frontComponentId",
          "frontComponent"."universalIdentifier" AS "frontComponentUniversalIdentifier"
        FROM "core"."application" application
        INNER JOIN "core"."frontComponent" "frontComponent"
          ON "frontComponent"."id" = application."settingsCustomTabFrontComponentId"
        WHERE application."settingsCustomTabFrontComponentId" IS NOT NULL
      `);

    for (const legacySettingsTabRow of legacySettingsTabRows) {
      const universalIdentifier = getLegacySettingPageUniversalIdentifier({
        applicationUniversalIdentifier:
          legacySettingsTabRow.applicationUniversalIdentifier,
        frontComponentUniversalIdentifier:
          legacySettingsTabRow.frontComponentUniversalIdentifier,
      });

      await dataSource.query(
        `
          INSERT INTO "core"."settingPage"
            ("workspaceId", "universalIdentifier", "applicationId", "frontComponentId", "title", "icon", "position", "scope")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT ("workspaceId", "universalIdentifier") DO NOTHING
        `,
        [
          legacySettingsTabRow.workspaceId,
          universalIdentifier,
          legacySettingsTabRow.applicationId,
          legacySettingsTabRow.frontComponentId,
          LEGACY_SETTING_PAGE_TITLE,
          LEGACY_SETTING_PAGE_ICON,
          LEGACY_SETTING_PAGE_POSITION,
          LEGACY_SETTING_PAGE_SCOPE,
        ],
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
