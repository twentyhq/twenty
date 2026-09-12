import {
  type AiSdkPackage,
  NATIVE_AI_SDK_PROVIDER_IDS,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';
import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';
import { inferModelFamily } from 'src/engine/metadata-modules/ai/ai-models/utils/infer-model-family.util';

import { type GeneratedCatalog } from '../types/generated-catalog.type';
import { type GeneratedModel } from '../types/generated-model.type';

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

const isLanguageModel = (modelId: string): boolean => {
  const lowerId = modelId.toLowerCase();

  if (EXCLUDED_MODEL_PREFIXES.some((prefix) => lowerId.startsWith(prefix))) {
    return false;
  }

  return !EXCLUDED_MODEL_SUFFIXES.some((suffix) => lowerId.endsWith(suffix));
};

const meetsInclusionCriteria = (modelData: ModelsDevModel): boolean =>
  modelData.status !== 'beta' &&
  (modelData.tool_call ?? false) &&
  isDefined(modelData.cost?.input) &&
  isDefined(modelData.limit?.context);

const extractCost = ({
  modelData,
  model,
}: {
  modelData: ModelsDevModel;
  model: GeneratedModel;
}): void => {
  const cost = modelData.cost;

  if (!isDefined(cost)) {
    return;
  }

  model.inputCostPerMillionTokens = cost.input;
  model.outputCostPerMillionTokens = cost.output;
  model.cachedInputCostPerMillionTokens = cost.cache_read;
  model.cacheCreationCostPerMillionTokens = cost.cache_write;

  const longContextCost = cost.context_over_200k;

  if (!isDefined(longContextCost?.input)) {
    return;
  }

  model.longContextCost = {
    inputCostPerMillionTokens: longContextCost.input,
    outputCostPerMillionTokens:
      longContextCost.output ?? model.outputCostPerMillionTokens ?? 0,
    thresholdTokens: LONG_CONTEXT_THRESHOLD_TOKENS,
    cachedInputCostPerMillionTokens: longContextCost.cache_read,
    cacheCreationCostPerMillionTokens: longContextCost.cache_write,
  };
};

const buildModel = ({
  providerName,
  modelId,
  modelData,
}: {
  providerName: string;
  modelId: string;
  modelData: ModelsDevModel;
}): GeneratedModel => {
  const model: GeneratedModel = {
    name: modelId,
    label: modelData.name ?? modelId,
    modelFamily: inferModelFamily(providerName, modelId),
  };

  extractCost({ modelData, model });

  model.contextWindowTokens = modelData.limit?.context;
  model.maxOutputTokens = modelData.limit?.output;

  const modalities = (modelData.modalities?.input ?? []).filter(
    (modality) => modality !== 'text',
  );

  if (modalities.length > 0) {
    model.modalities = modalities;
  }

  if (modelData.reasoning) {
    model.supportsReasoning = true;
  }

  if (modelData.status === 'deprecated') {
    model.isDeprecated = true;
  }

  return model;
};

export const buildCatalog = (data: ModelsDevData): GeneratedCatalog => {
  const catalog: GeneratedCatalog = {};

  for (const providerName of NATIVE_AI_SDK_PROVIDER_IDS) {
    const providerData = data[providerName];

    if (!isDefined(providerData)) {
      // oxlint-disable-next-line no-console
      console.warn(`Provider "${providerName}" not found in models.dev`);
      continue;
    }

    const models = Object.entries(providerData.models)
      .filter(
        ([modelId, modelData]) =>
          isLanguageModel(modelId) && meetsInclusionCriteria(modelData),
      )
      .map(([modelId, modelData]) =>
        buildModel({ providerName, modelId, modelData }),
      );

    if (models.length === 0) {
      // oxlint-disable-next-line no-console
      console.warn(`No qualifying models for "${providerName}", skipping`);
      continue;
    }

    catalog[providerName] = {
      npm: `@ai-sdk/${providerName}` as AiSdkPackage,
      label: PROVIDER_LABELS[providerName] ?? providerName,
      apiKey: API_KEY_TEMPLATES[providerName] ?? '',
      models,
    };
  }

  return catalog;
};
