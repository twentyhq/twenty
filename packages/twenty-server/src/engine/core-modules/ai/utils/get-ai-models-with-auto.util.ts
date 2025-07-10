import {
  AI_MODELS,
  AIModelConfig,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

import { getDefaultModelConfig } from './get-default-model-config.util';

export const getAIModelsWithAuto = (): AIModelConfig[] => {
  return [
    {
      modelId: 'auto',
      label: 'Auto',
      provider: ModelProvider.NONE,
      inputCostPer1kTokensInCents:
        getDefaultModelConfig().inputCostPer1kTokensInCents,
      outputCostPer1kTokensInCents:
        getDefaultModelConfig().outputCostPer1kTokensInCents,
    },
    ...AI_MODELS,
  ];
};
