import { type AiSdkPackage } from 'twenty-shared/ai';

import { type AiModelBenchmarks } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

export type LongContextCostEntry = {
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  thresholdTokens: number;
};

export type GeneratedModel = {
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
  benchmarks?: AiModelBenchmarks;
  isDeprecated?: boolean;
};

export type GeneratedProvider = {
  npm: AiSdkPackage;
  label: string;
  apiKey: string;
  models: GeneratedModel[];
};

export type GeneratedCatalog = Record<string, GeneratedProvider>;

export type BenchmarkRecord = {
  intelligenceIndex?: number;
  outputTokensPerSecond?: number;
  timeToFirstTokenSeconds?: number;
  costPerTask?: number;
  aliases: string[];
};

// Keyed by normalized model name, so a single lookup resolves every alias a
// source publishes for the same underlying model.
export type BenchmarkIndex = Map<string, BenchmarkRecord>;
