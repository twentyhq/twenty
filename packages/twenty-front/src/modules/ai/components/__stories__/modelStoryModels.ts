import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const MODEL_STORY_MODELS: ClientAiModelConfig[] = [
  {
    modelId: 'story/reasoning-one',
    label: 'Reasoning One',
    providerName: 'openai',
    providerLabel: 'OpenAI',
    efforts: ['low', 'high'],
    nativeCapabilities: { webSearch: true, twitterSearch: false },
  },
  {
    modelId: 'story/reasoning-two',
    label: 'Reasoning Two',
    providerName: 'openai',
    providerLabel: 'OpenAI',
    efforts: ['high'],
    nativeCapabilities: { webSearch: true, twitterSearch: false },
  },
  {
    modelId: 'story/fast',
    label: 'Fast Model',
    providerName: 'openai',
    providerLabel: 'OpenAI',
    nativeCapabilities: { webSearch: false, twitterSearch: false },
  },
];
