import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitAiProvidersConfig1774000000000 implements MigrationInterface {
  name = 'SplitAiProvidersConfig1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Clean up legacy keys — preferences will be re-derived from catalog defaults
    await queryRunner.query(
      `DELETE FROM "core"."keyValuePair"
       WHERE "key" IN ('DEFAULT_AI_SPEED_MODEL_ID', 'DEFAULT_AI_PERFORMANCE_MODEL_ID')
         AND "type" = 'CONFIG_VARIABLE'
         AND "userId" IS NULL
         AND "workspaceId" IS NULL`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy keys are not restored — they are superseded by AI_MODEL_PREFERENCES
  }
}
