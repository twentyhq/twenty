import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

import {
  type AiSdkPackage,
  NATIVE_AI_SDK_PROVIDER_IDS,
} from 'twenty-shared/ai';

import { MODELS_DEV_API_URL } from 'src/engine/metadata-modules/ai/ai-models/constants/models-dev.const';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';
import { inferModelFamily } from 'src/engine/metadata-modules/ai/ai-models/utils/infer-model-family.util';

const EXCLUDED_MODEL_PREFIXES = [
  'text-embedding',
  'embedding',
  'dall-e',
  'tts-',
  'whisper',
  'moderation',
  'davinci',
  'babbage',
  'ada',
  'curie',
  'text-search',
  'text-similarity',
  'code-search',
  'text-davinci',
  'text-curie',
  'text-babbage',
  'text-ada',
  'ft:',
  'canary',
];

const EXCLUDED_MODEL_SUFFIXES = ['-audio-preview', '-realtime-preview'];

const LONG_CONTEXT_THRESHOLD_TOKENS = 200000;

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  mistral: 'Mistral',
  xai: 'xAI',
};

const API_KEY_TEMPLATES: Record<string, string> = {
  openai: '{{OPENAI_API_KEY}}',
  anthropic: '{{ANTHROPIC_API_KEY}}',
  google: '{{GOOGLE_API_KEY}}',
  mistral: '{{MISTRAL_API_KEY}}',
  xai: '{{XAI_API_KEY}}',
};

type LongContextCostEntry = {
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  thresholdTokens: number;
};

type GeneratedModel = {
  name: string;
  label: string;
  description?: string;
  modelFamily?: ModelFamily;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCostEntry;
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  modalities?: string[];
  supportsReasoning?: boolean;
  isDeprecated?: boolean;
};

type GeneratedProvider = {
  npm: AiSdkPackage;
  label: string;
  apiKey: string;
  models: GeneratedModel[];
};

const isLanguageModel = (modelId: string): boolean => {
  const lowerId = modelId.toLowerCase();

  for (const prefix of EXCLUDED_MODEL_PREFIXES) {
    if (lowerId.startsWith(prefix)) return false;
  }

  for (const suffix of EXCLUDED_MODEL_SUFFIXES) {
    if (lowerId.endsWith(suffix)) return false;
  }

  return true;
};

const meetsInclusionCriteria = (
  modelData: Record<string, unknown>,
): boolean => {
  if (modelData.status === 'beta') return false;
  if (modelData.tool_call !== true) return false;

  const cost = modelData.cost as
    | { input?: number; output?: number }
    | undefined;

  if (cost?.input === undefined) return false;

  const limit = modelData.limit as
    | { context?: number; output?: number }
    | undefined;

  if (limit?.context === undefined) return false;

  return true;
};

const extractCost = (
  modelData: Record<string, unknown>,
  model: GeneratedModel,
): void => {
  const cost = modelData.cost as Record<string, unknown> | undefined;

  if (!cost) return;

  if (typeof cost.input === 'number') {
    model.inputCostPerMillionTokens = cost.input;
  }
  if (typeof cost.output === 'number') {
    model.outputCostPerMillionTokens = cost.output;
  }
  if (typeof cost.cache_read === 'number') {
    model.cachedInputCostPerMillionTokens = cost.cache_read;
  }
  if (typeof cost.cache_write === 'number') {
    model.cacheCreationCostPerMillionTokens = cost.cache_write;
  }

  const longCtx = cost.context_over_200k as
    | Record<string, unknown>
    | undefined;

  if (longCtx && typeof longCtx.input === 'number') {
    model.longContextCost = {
      inputCostPerMillionTokens: longCtx.input as number,
      outputCostPerMillionTokens: (longCtx.output as number) ?? 0,
      thresholdTokens: LONG_CONTEXT_THRESHOLD_TOKENS,
    };
    if (typeof longCtx.cache_read === 'number') {
      model.longContextCost.cachedInputCostPerMillionTokens =
        longCtx.cache_read;
    }
    if (typeof longCtx.cache_write === 'number') {
      model.longContextCost.cacheCreationCostPerMillionTokens =
        longCtx.cache_write;
    }
  }
};

const extractLimits = (
  modelData: Record<string, unknown>,
  model: GeneratedModel,
): void => {
  const limit = modelData.limit as Record<string, unknown> | undefined;

  if (!limit) return;

  if (typeof limit.context === 'number') {
    model.contextWindowTokens = limit.context;
  }
  if (typeof limit.output === 'number') {
    model.maxOutputTokens = limit.output;
  }
};

const extractModalities = (
  modelData: Record<string, unknown>,
  model: GeneratedModel,
): void => {
  const modalities = modelData.modalities as { input?: string[] } | undefined;

  if (!modalities?.input) return;

  const relevant = modalities.input.filter((modality) => modality !== 'text');

  if (relevant.length > 0) {
    model.modalities = relevant;
  }
};

const buildModelsForProvider = (
  providerName: string,
  modelsDevModels: Record<string, { name: string } & Record<string, unknown>>,
): GeneratedModel[] => {
  const qualifying: GeneratedModel[] = [];

  for (const [modelId, modelData] of Object.entries(modelsDevModels)) {
    if (!isLanguageModel(modelId)) continue;
    if (!meetsInclusionCriteria(modelData)) continue;

    const family = inferModelFamily(providerName, modelId);

    const model: GeneratedModel = {
      name: modelId,
      label: modelData.name ?? modelId,
      modelFamily: family,
    };

    extractCost(modelData, model);
    extractLimits(modelData, model);
    extractModalities(modelData, model);

    if (modelData.reasoning === true) {
      model.supportsReasoning = true;
    }

    if (modelData.status === 'deprecated') {
      model.isDeprecated = true;
    }

    qualifying.push(model);
  }

  return qualifying;
};

const generateCatalog = (
  data: ModelsDevData,
): Record<string, GeneratedProvider> => {
  const result: Record<string, GeneratedProvider> = {};

  for (const providerName of NATIVE_AI_SDK_PROVIDER_IDS) {
    const providerData = data[providerName];

    if (!providerData) {
      // oxlint-disable-next-line no-console
      console.warn(`Provider "${providerName}" not found in models.dev`);
      continue;
    }

    const models = buildModelsForProvider(providerName, providerData.models);

    if (models.length === 0) {
      // oxlint-disable-next-line no-console
      console.warn(`No qualifying models for "${providerName}", skipping`);
      continue;
    }

    result[providerName] = {
      npm: `@ai-sdk/${providerName}`,
      label: PROVIDER_LABELS[providerName] ?? providerName,
      apiKey: API_KEY_TEMPLATES[providerName] ?? '',
      models,
    };
  }

  return result;
};

const printSummary = (catalog: Record<string, GeneratedProvider>): void => {
  // oxlint-disable-next-line no-console
  console.log('=== Generation Summary ===');

  let totalModels = 0;
  let deprecatedCount = 0;

  for (const [providerName, provider] of Object.entries(catalog)) {
    const deprecatedModelCount = provider.models.filter(
      (model) => model.isDeprecated,
    ).length;
    const active = provider.models.length - deprecatedModelCount;

    // oxlint-disable-next-line no-console
    console.log(
      `  ${providerName}: ${provider.models.length} models (${active} active, ${deprecatedModelCount} deprecated)`,
    );
    totalModels += provider.models.length;
    deprecatedCount += deprecatedModelCount;
  }

  // oxlint-disable-next-line no-console
  console.log(
    `Total: ${totalModels} models (${totalModels - deprecatedCount} active, ${deprecatedCount} deprecated)`,
  );
};

const main = async (): Promise<void> => {
  const dryRun = process.argv.includes('--dry-run');

  // oxlint-disable-next-line no-console
  console.log('Fetching models.dev API...');

  const response = await fetch(MODELS_DEV_API_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`,
    );
  }

  const data: ModelsDevData = await response.json();

  // oxlint-disable-next-line no-console
  console.log(`Fetched ${Object.keys(data).length} providers from models.dev`);

  const generated = generateCatalog(data);
  const json = JSON.stringify(generated, null, 2) + '\n';

  printSummary(generated);

  if (dryRun) {
    // oxlint-disable-next-line no-console
    console.log('[DRY RUN] Would write ai-providers.json');

    return;
  }

  const outputPath = path.resolve(
    __dirname,
    '..',
    'src',
    'engine',
    'metadata-modules',
    'ai',
    'ai-models',
    'ai-providers.json',
  );

  const prettierConfig = await prettier.resolveConfig(outputPath);

  const formatted = await prettier.format(json, {
    ...prettierConfig,
    filepath: outputPath,
  });

  fs.writeFileSync(outputPath, formatted, 'utf-8');
  // oxlint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
};

main().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('AI catalog sync failed:', error);
  process.exit(1);
});
