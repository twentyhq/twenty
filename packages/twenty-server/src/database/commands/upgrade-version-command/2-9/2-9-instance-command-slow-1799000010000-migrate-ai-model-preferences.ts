import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, IsNull, QueryRunner } from 'typeorm';

import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { aiModelPreferencesSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.schema';

const NEW_KEYS = [
  'AI_MODELS_DEFAULT_FAST',
  'AI_MODELS_DEFAULT_SMART',
  'AI_MODELS_DEFAULT_RECOMMENDED',
  'AI_MODELS_DEFAULT_DISABLED',
] as const;

const PREFERENCE_KEY_MAP = {
  AI_MODELS_DEFAULT_FAST: 'defaultFastModels',
  AI_MODELS_DEFAULT_SMART: 'defaultSmartModels',
  AI_MODELS_DEFAULT_RECOMMENDED: 'recommendedModels',
  AI_MODELS_DEFAULT_DISABLED: 'disabledModels',
} as const;

@RegisteredInstanceCommand('2.9.0', 1799000010000, { type: 'slow' })
export class MigrateAiModelPreferencesSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    MigrateAiModelPreferencesSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const keyValuePairRepository = dataSource.getRepository(KeyValuePairEntity);

    const existingRow = await keyValuePairRepository.findOne({
      where: {
        type: KeyValuePairType.CONFIG_VARIABLE,
        key: 'AI_MODEL_PREFERENCES',
        userId: IsNull(),
        workspaceId: IsNull(),
      },
    });

    if (!isDefined(existingRow)) {
      this.logger.log(
        'No server-level AI_MODEL_PREFERENCES row found, skipping',
      );

      return;
    }

    const parseResult = aiModelPreferencesSchema.safeParse(existingRow.value);

    if (!parseResult.success) {
      this.logger.error(
        `Failed to parse server-level AI_MODEL_PREFERENCES: ${parseResult.error.message}`,
      );

      return;
    }

    const prefs = parseResult.data;

    this.logger.log('Migrating server-level AI_MODEL_PREFERENCES');

    await dataSource.transaction(async (manager) => {
      const transactionalRepository = manager.getRepository(KeyValuePairEntity);

      for (const newKey of NEW_KEYS) {
        const prefField = PREFERENCE_KEY_MAP[newKey];
        const value = prefs[prefField];

        if (!isDefined(value) || value.length === 0) {
          continue;
        }

        const existingNewKeyCount = await transactionalRepository.count({
          where: {
            type: KeyValuePairType.CONFIG_VARIABLE,
            key: newKey,
            userId: IsNull(),
            workspaceId: IsNull(),
          },
        });

        if (existingNewKeyCount > 0) {
          continue;
        }

        await transactionalRepository.insert({
          key: newKey,
          value: value as unknown as JSON,
          type: KeyValuePairType.CONFIG_VARIABLE,
          userId: null,
          workspaceId: null,
        });
      }

      await transactionalRepository.delete({ id: existingRow.id });
    });

    this.logger.log(
      'Migrated server-level AI_MODEL_PREFERENCES to 4 individual vars',
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
