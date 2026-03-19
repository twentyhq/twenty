import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { loadDefaultAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-ai-providers.util';

const MODELS_DEV_API_URL = 'https://models.dev/api.json';

const PROVIDER_TYPE_MAP: Record<string, AiProvider> = {
  openai: AiProvider.OPENAI,
  anthropic: AiProvider.ANTHROPIC,
  google: AiProvider.GOOGLE,
  mistral: AiProvider.MISTRAL,
  xai: AiProvider.XAI,
  groq: AiProvider.GROQ,
};

const RELEVANT_PROVIDERS = Object.keys(PROVIDER_TYPE_MAP);

type ModelsDevModel = {
  id: string;
  name: string;
  reasoning?: boolean;
  cost?: { input?: number; output?: number };
  limit?: { context?: number; output?: number };
};

type ModelsDevProvider = {
  id: string;
  models: Record<string, ModelsDevModel>;
};

type ModelsDevData = Record<string, ModelsDevProvider>;

type CatalogEntry = {
  compositeId: string;
  rawModelId: string;
  provider: AiProvider;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
};

@Command({
  name: 'ai:sync-models-dev',
  description:
    'Compare ai-providers.json against models.dev API — reports pricing diffs, new models, and removed models',
})
export class AiSyncModelsDevCommand extends CommandRunner {
  private readonly logger = new Logger(AiSyncModelsDevCommand.name);

  async run(): Promise<void> {
    const defaultProviders = loadDefaultAiProviders();

    if (Object.keys(defaultProviders).length === 0) {
      this.logger.error(
        'No default providers found. Make sure ai-providers.json exists.',
      );

      return;
    }

    this.logger.log('Fetching models.dev API...');

    const response = await fetch(MODELS_DEV_API_URL);

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch: ${response.status} ${response.statusText}`,
      );

      return;
    }

    const data: ModelsDevData = await response.json();
    const catalogEntries = this.getCatalogEntries(defaultProviders);
    const pricingDiffs = this.findPricingDiffs(catalogEntries, data);
    const notInModelsdev = this.findMissingFromModelsdev(catalogEntries, data);
    const newModels = this.findNewModels(catalogEntries, data);

    this.printReport(pricingDiffs, notInModelsdev, newModels);
  }

  private getCatalogEntries(providers: AiProvidersConfig): CatalogEntry[] {
    const entries: CatalogEntry[] = [];

    for (const config of Object.values(providers)) {
      for (const model of config.models ?? []) {
        entries.push({
          compositeId: `${config.type}/${model.rawModelId}`,
          rawModelId: model.rawModelId,
          provider: config.type,
          inputCostPerMillionTokens: model.inputCostPerMillionTokens ?? 0,
          outputCostPerMillionTokens: model.outputCostPerMillionTokens ?? 0,
        });
      }
    }

    return entries;
  }

  private getProviderKey(provider: AiProvider): string | undefined {
    return Object.entries(PROVIDER_TYPE_MAP).find(
      ([, p]) => p === provider,
    )?.[0];
  }

  private findPricingDiffs(
    catalogEntries: CatalogEntry[],
    data: ModelsDevData,
  ): string[] {
    const diffs: string[] = [];

    for (const entry of catalogEntries) {
      const providerKey = this.getProviderKey(entry.provider);

      if (!providerKey) continue;

      const model = data[providerKey]?.models[entry.rawModelId];

      if (!model) continue;

      const mdInput = model.cost?.input ?? 0;
      const mdOutput = model.cost?.output ?? 0;

      if (
        Math.abs(mdInput - entry.inputCostPerMillionTokens) > 0.001 ||
        Math.abs(mdOutput - entry.outputCostPerMillionTokens) > 0.001
      ) {
        diffs.push(
          `  ${entry.compositeId}:` +
            `\n    input:  ours=$${entry.inputCostPerMillionTokens} models.dev=$${mdInput}` +
            `\n    output: ours=$${entry.outputCostPerMillionTokens} models.dev=$${mdOutput}`,
        );
      }
    }

    return diffs;
  }

  private findMissingFromModelsdev(
    catalogEntries: CatalogEntry[],
    data: ModelsDevData,
  ): string[] {
    const missing: string[] = [];

    for (const entry of catalogEntries) {
      if (entry.provider === AiProvider.BEDROCK) continue;

      const providerKey = this.getProviderKey(entry.provider);

      if (!providerKey) continue;

      const providerData = data[providerKey];

      if (!providerData) {
        missing.push(
          `  ${entry.compositeId} (provider ${providerKey} not found)`,
        );
        continue;
      }

      if (!providerData.models[entry.rawModelId]) {
        missing.push(`  ${entry.compositeId}`);
      }
    }

    return missing;
  }

  private findNewModels(
    catalogEntries: CatalogEntry[],
    data: ModelsDevData,
  ): string[] {
    const catalogRawIdsByProvider = new Map<string, Set<string>>();

    for (const entry of catalogEntries) {
      const providerKey = this.getProviderKey(entry.provider);

      if (!providerKey) continue;

      if (!catalogRawIdsByProvider.has(providerKey)) {
        catalogRawIdsByProvider.set(providerKey, new Set());
      }
      catalogRawIdsByProvider.get(providerKey)!.add(entry.rawModelId);
    }

    const newModels: string[] = [];

    for (const providerKey of RELEVANT_PROVIDERS) {
      const providerData = data[providerKey];

      if (!providerData) continue;

      const knownRawIds = catalogRawIdsByProvider.get(providerKey) ?? new Set();

      for (const [modelId, model] of Object.entries(providerData.models)) {
        if (!knownRawIds.has(modelId)) {
          const cost = model.cost
            ? `$${model.cost.input ?? '?'}/$${model.cost.output ?? '?'}`
            : 'no pricing';

          newModels.push(`  ${providerKey}/${modelId} (${cost})`);
        }
      }
    }

    return newModels;
  }

  private printReport(
    pricingDiffs: string[],
    notInModelsdev: string[],
    newModels: string[],
  ): void {
    this.logger.log('=== models.dev Sync Report ===');

    if (pricingDiffs.length > 0) {
      this.logger.log(`PRICING DIFFS (${pricingDiffs.length}):`);
      this.logger.log(pricingDiffs.join('\n'));
    } else {
      this.logger.log('No pricing diffs found.');
    }

    if (notInModelsdev.length > 0) {
      this.logger.log(`NOT IN models.dev (${notInModelsdev.length}):`);
      this.logger.log(notInModelsdev.join('\n'));
    }

    if (newModels.length > 0) {
      this.logger.log(`NEW MODELS AVAILABLE (${newModels.length}):`);
      this.logger.log(newModels.join('\n'));
    } else {
      this.logger.log('No new models available.');
    }

    if (pricingDiffs.length > 0) {
      this.logger.warn(
        'Action needed: review pricing diffs above and update ai-providers.json',
      );
    } else {
      this.logger.log('All good! Catalog is in sync with models.dev pricing.');
    }
  }
}
