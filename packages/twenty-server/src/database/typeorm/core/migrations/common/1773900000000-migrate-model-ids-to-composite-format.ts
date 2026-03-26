import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateModelIdsToCompositeFormat1773900000000
  implements MigrationInterface
{
  name = 'MigrateModelIdsToCompositeFormat1773900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reset workspace model columns to auto-select placeholders.
    // The runtime resolves these dynamically from admin preferences.
    await queryRunner.query(
      `UPDATE "core"."workspace"
       SET "fastModel" = 'default-fast-model',
           "smartModel" = 'default-smart-model'
       WHERE "fastModel" != 'default-fast-model'
          OR "smartModel" != 'default-smart-model'`,
    );

    // Clear per-workspace model allow/deny lists — admin preferences take over
    await queryRunner.query(
      `UPDATE "core"."workspace"
       SET "disabledAiModelIds" = '{}',
           "enabledAiModelIds" = '{}'
       WHERE array_length("disabledAiModelIds", 1) > 0
          OR array_length("enabledAiModelIds", 1) > 0`,
    );

    // Reset agent model IDs to the auto-select placeholder so they fall back to workspace defaults
    await queryRunner.query(
      `UPDATE "core"."agent"
       SET "modelId" = 'default-smart-model'
       WHERE "modelId" != 'default-smart-model'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No reversal needed — auto-select placeholders are safe to leave in place.
  }
}
