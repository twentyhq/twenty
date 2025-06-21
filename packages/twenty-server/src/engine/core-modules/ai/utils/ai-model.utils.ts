import {
  AI_MODELS,
  AIModelConfig,
  ModelId,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

export const getAIModelById = (modelId: ModelId): AIModelConfig | undefined => {
  return AI_MODELS.find((model) => model.modelId === modelId);
};
