import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitAiProvidersConfig1774000000000 implements MigrationInterface {
  name = 'SplitAiProvidersConfig1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename AI_PROVIDERS -> AI_CUSTOM_PROVIDERS in key_value_pair table
    await queryRunner.query(
      `UPDATE "core"."keyValuePair"
       SET "key" = 'AI_CUSTOM_PROVIDERS'
       WHERE "key" = 'AI_PROVIDERS'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );

    // Migrate DEFAULT_AI_SPEED_MODEL_ID and DEFAULT_AI_PERFORMANCE_MODEL_ID
    // into a new AI_MODEL_PREFERENCES entry
    const speedRow = await queryRunner.query(
      `SELECT "value" FROM "core"."keyValuePair"
       WHERE "key" = 'DEFAULT_AI_SPEED_MODEL_ID'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );

    const perfRow = await queryRunner.query(
      `SELECT "value" FROM "core"."keyValuePair"
       WHERE "key" = 'DEFAULT_AI_PERFORMANCE_MODEL_ID'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );

    const hasCustomDefaults = speedRow.length > 0 || perfRow.length > 0;

    if (hasCustomDefaults) {
      const prefs: Record<string, unknown> = {};

      if (speedRow.length > 0 && speedRow[0].value) {
        const rawValue =
          typeof speedRow[0].value === 'string'
            ? speedRow[0].value
            : JSON.stringify(speedRow[0].value);

        prefs.defaultFastModels = rawValue
          .replace(/^"|"$/g, '')
          .split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }

      if (perfRow.length > 0 && perfRow[0].value) {
        const rawValue =
          typeof perfRow[0].value === 'string'
            ? perfRow[0].value
            : JSON.stringify(perfRow[0].value);

        prefs.defaultSmartModels = rawValue
          .replace(/^"|"$/g, '')
          .split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }

      await queryRunner.query(
        `INSERT INTO "core"."keyValuePair" ("key", "value", "type", "userId", "workspaceId")
         VALUES ('AI_MODEL_PREFERENCES', $1, 'CONFIG_VARIABLE', NULL, NULL)
         ON CONFLICT DO NOTHING`,
        [JSON.stringify(prefs)],
      );
    }

    // Clean up old keys
    await queryRunner.query(
      `DELETE FROM "core"."keyValuePair"
       WHERE "key" IN ('DEFAULT_AI_SPEED_MODEL_ID', 'DEFAULT_AI_PERFORMANCE_MODEL_ID')
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename AI_CUSTOM_PROVIDERS back to AI_PROVIDERS
    await queryRunner.query(
      `UPDATE "core"."keyValuePair"
       SET "key" = 'AI_PROVIDERS'
       WHERE "key" = 'AI_CUSTOM_PROVIDERS'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );

    // Clean up AI_MODEL_PREFERENCES
    await queryRunner.query(
      `DELETE FROM "core"."keyValuePair"
       WHERE "key" = 'AI_MODEL_PREFERENCES'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );
  }
}
