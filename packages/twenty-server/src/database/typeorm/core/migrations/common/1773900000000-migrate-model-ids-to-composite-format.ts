import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateModelIdsToCompositeFormat1773900000000
  implements MigrationInterface
{
  name = 'MigrateModelIdsToCompositeFormat1773900000000';

  // Maps old bare model IDs to new provider/modelId composite format
  private readonly modelIdMappings: Array<[string, string]> = [
    ['gpt-5.2', 'openai/gpt-5.2'],
    ['gpt-5-mini', 'openai/gpt-5-mini'],
    ['gpt-4.1', 'openai/gpt-4.1'],
    ['gpt-4.1-mini', 'openai/gpt-4.1-mini'],
    ['o3', 'openai/o3'],
    ['o4-mini', 'openai/o4-mini'],
    ['gpt-4o', 'openai/gpt-4o'],
    ['gpt-4o-mini', 'openai/gpt-4o-mini'],
    ['gpt-4-turbo', 'openai/gpt-4-turbo'],
    ['claude-opus-4-6', 'anthropic/claude-opus-4-6'],
    ['claude-sonnet-4-6', 'anthropic/claude-sonnet-4-6'],
    ['claude-sonnet-4-5-20250929', 'anthropic/claude-sonnet-4-5-20250929'],
    ['claude-haiku-4-5-20251001', 'anthropic/claude-haiku-4-5-20251001'],
    ['claude-opus-4-5-20251101', 'anthropic/claude-opus-4-5-20251101'],
    ['claude-sonnet-4-20250514', 'anthropic/claude-sonnet-4-20250514'],
    ['claude-opus-4-20250514', 'anthropic/claude-opus-4-20250514'],
    ['claude-3-5-haiku-20241022', 'anthropic/claude-3-5-haiku-20241022'],
    ['anthropic.claude-opus-4-6-v1', 'bedrock/anthropic.claude-opus-4-6-v1'],
    ['anthropic.claude-sonnet-4-6', 'bedrock/anthropic.claude-sonnet-4-6'],
    ['gemini-3.1-pro-preview', 'google/gemini-3.1-pro-preview'],
    ['gemini-3-flash-preview', 'google/gemini-3-flash-preview'],
    ['gemini-3.1-flash-lite-preview', 'google/gemini-3.1-flash-lite-preview'],
    ['gemini-2.5-pro', 'google/gemini-2.5-pro'],
    ['gemini-2.5-flash', 'google/gemini-2.5-flash'],
    ['grok-4', 'xai/grok-4'],
    ['grok-4-1-fast-reasoning', 'xai/grok-4-1-fast-reasoning'],
    ['grok-3', 'xai/grok-3'],
    ['grok-3-mini', 'xai/grok-3-mini'],
    ['openai/gpt-oss-120b', 'groq/openai/gpt-oss-120b'],
    ['mistral-large-latest', 'mistral/mistral-large-latest'],
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migrate agent.modelId to composite format
    for (const [oldId, newId] of this.modelIdMappings) {
      await queryRunner.query(
        `UPDATE "core"."agent" SET "modelId" = $1 WHERE "modelId" = $2`,
        [newId, oldId],
      );
    }

    // Reset workspace model columns to sentinel defaults.
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Agent model IDs: reverse the mapping
    for (const [oldId, newId] of this.modelIdMappings) {
      await queryRunner.query(
        `UPDATE "core"."agent" SET "modelId" = $1 WHERE "modelId" = $2`,
        [oldId, newId],
      );
    }
  }
}
