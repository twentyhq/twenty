import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import {
  buildWorkspaceTranslationMessagesFromStandardOverrides,
  type FieldStandardOverridesRow,
  type ObjectStandardOverridesRow,
} from 'src/engine/metadata-modules/workspace-translation/utils/build-workspace-translation-messages-from-standard-overrides.util';

// Moves the legacy element-keyed `standardOverrides.translations` (per
// object/field) into the value-keyed workspace translation catalog.
@RegisteredInstanceCommand('2.19.0', 1802000010000, { type: 'slow' })
export class MigrateStandardOverrideTranslationsToWorkspaceCatalogSlowInstanceCommand
  implements SlowInstanceCommand
{
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}

  public async runDataMigration(dataSource: DataSource): Promise<void> {
    const objectRows: ObjectStandardOverridesRow[] = await dataSource.query(
      `SELECT "workspaceId", "labelSingular", "labelPlural", "description", "standardOverrides"
       FROM "core"."objectMetadata"
       WHERE "standardOverrides" -> 'translations' IS NOT NULL`,
    );

    const fieldRows: FieldStandardOverridesRow[] = await dataSource.query(
      `SELECT "workspaceId", "label", "description", "standardOverrides"
       FROM "core"."fieldMetadata"
       WHERE "standardOverrides" -> 'translations' IS NOT NULL`,
    );

    const entries = buildWorkspaceTranslationMessagesFromStandardOverrides({
      objectRows,
      fieldRows,
    });

    for (const { workspaceId, locale, messages } of entries) {
      if (Object.keys(messages).length === 0) {
        continue;
      }

      const existingRows: { id: string; messages: Record<string, string> }[] =
        await dataSource.query(
          `SELECT "id", "messages" FROM "core"."workspaceTranslation"
           WHERE "workspaceId" = $1 AND "locale" = $2 AND "deletedAt" IS NULL
           LIMIT 1`,
          [workspaceId, locale],
        );

      const existingRow = existingRows[0];

      if (existingRow !== undefined) {
        // A pre-existing bench override wins over the migrated value.
        const mergedMessages = { ...messages, ...existingRow.messages };

        await dataSource.query(
          `UPDATE "core"."workspaceTranslation"
           SET "messages" = $1, "updatedAt" = now() WHERE "id" = $2`,
          [JSON.stringify(mergedMessages), existingRow.id],
        );
      } else {
        await dataSource.query(
          `INSERT INTO "core"."workspaceTranslation" ("workspaceId", "locale", "messages")
           VALUES ($1, $2, $3)`,
          [workspaceId, locale, JSON.stringify(messages)],
        );
      }
    }
  }
}
