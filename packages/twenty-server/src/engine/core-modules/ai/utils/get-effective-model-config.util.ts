import {
  AI_MODELS,
  AIModelConfig,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

import { getDefaultModelConfig } from './get-default-model-config.util';

export const getEffectiveModelConfig = (modelId: string): AIModelConfig => {
  if (modelId === 'auto') {
    return getDefaultModelConfig();
  }

  const model = AI_MODELS.find((model) => model.modelId === modelId);

  if (!model) {
    throw new Error(`Model with ID ${modelId} not found`);
  }

  return model;
};
