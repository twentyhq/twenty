import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { IsNull, Repository } from 'typeorm';

import { isArray, isDefined } from 'class-validator';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
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

@RegisteredWorkspaceCommand('2.9.0', 1799000000000)
@Command({
  name: 'upgrade:2-9:migrate-ai-model-preferences',
  description:
    'Migrate AI_MODEL_PREFERENCES config var to the four individual AI_MODELS_DEFAULT_* vars, per workspace',
})
export class MigrateAiModelPreferencesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(KeyValuePairEntity)
    private readonly keyValuePairRepository: Repository<KeyValuePairEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const existingPreferencesRow = await this.keyValuePairRepository.findOne({
      where: {
        key: 'AI_MODEL_PREFERENCES',
        type: KeyValuePairType.CONFIG_VARIABLE,
        workspaceId,
        userId: IsNull(),
      },
    });

    if (existingPreferencesRow === null) {
      this.logger.log(
        `No AI_MODEL_PREFERENCES row found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const parseResult = aiModelPreferencesSchema.safeParse(
      existingPreferencesRow.value,
    );

    if (!parseResult.success) {
      this.logger.error(
        `Failed to parse AI_MODEL_PREFERENCES for workspace ${workspaceId}: ${parseResult.error.message}`,
      );

      return;
    }

    const prefs = parseResult.data;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Migrating AI_MODEL_PREFERENCES for workspace ${workspaceId}`,
    );

    for (const newKey of NEW_KEYS) {
      const prefField = PREFERENCE_KEY_MAP[newKey];
      if (
        !isDefined(prefField) ||
        (isArray(prefs[prefField]) && prefs[prefField].length === 0)
      ) {
        continue;
      }
      const value = prefs[prefField];

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would insert ${newKey} = ${JSON.stringify(value)} for workspace ${workspaceId}`,
        );
        continue;
      }

      const existingNewKeyRow = await this.keyValuePairRepository.findOne({
        where: {
          key: newKey,
          type: KeyValuePairType.CONFIG_VARIABLE,
          workspaceId,
          userId: IsNull(),
        },
      });

      if (existingNewKeyRow !== null) {
        continue;
      }

      await this.keyValuePairRepository.insert({
        key: newKey,
        value: value as unknown as JSON,
        type: KeyValuePairType.CONFIG_VARIABLE,
        workspaceId,
        userId: null,
      });
    }

    if (!isDryRun) {
      await this.keyValuePairRepository.delete({
        id: existingPreferencesRow.id,
      });

      this.logger.log(
        `Migrated AI_MODEL_PREFERENCES to 4 individual vars for workspace ${workspaceId}`,
      );
    }
  }
}
