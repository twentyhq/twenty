import {
  AI_MODELS,
  AIModelConfig,
  ModelId,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

export const getAIModelById = (modelId: ModelId): AIModelConfig | undefined => {
  if (modelId === 'auto') {
    return AI_MODELS[1];
  }

  return AI_MODELS.find((model) => model.modelId === modelId);
};
