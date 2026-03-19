import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitAiProvidersConfig1774000000000 implements MigrationInterface {
  name = 'SplitAiProvidersConfig1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename AI_PROVIDERS -> AI_CUSTOM_PROVIDERS
    await queryRunner.query(
      `UPDATE "core"."keyValuePair"
       SET "key" = 'AI_CUSTOM_PROVIDERS'
       WHERE "key" = 'AI_PROVIDERS'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );

    // Clean up legacy keys — preferences will be re-derived from catalog defaults
    await queryRunner.query(
      `DELETE FROM "core"."keyValuePair"
       WHERE "key" IN ('DEFAULT_AI_SPEED_MODEL_ID', 'DEFAULT_AI_PERFORMANCE_MODEL_ID')
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."keyValuePair"
       SET "key" = 'AI_PROVIDERS'
       WHERE "key" = 'AI_CUSTOM_PROVIDERS'
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );
  }
}
