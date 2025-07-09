import {
    AIModelConfig,
    ModelId,
    getEffectiveModelConfig,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

export const getAIModelById = (modelId: ModelId): AIModelConfig | undefined => {
  try {
    return getEffectiveModelConfig(modelId);
  } catch {
    return undefined;
  }
};
