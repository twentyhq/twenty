import { AIModelConfig } from 'src/engine/core-modules/ai/constants/ai-models.const';

import { getEffectiveModelConfig } from './get-effective-model-config.util';

export const getAIModelById = (modelId: string): AIModelConfig => {
  return getEffectiveModelConfig(modelId);
};
