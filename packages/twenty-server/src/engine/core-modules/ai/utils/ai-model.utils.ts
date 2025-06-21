import {
  AI_MODELS,
  AIModelConfig,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

export const getActiveAIModels = (): AIModelConfig[] => {
  return AI_MODELS.filter((model) => model.isActive);
};

export const getAIModelById = (modelId: string): AIModelConfig | undefined => {
  return AI_MODELS.find((model) => model.modelId === modelId && model.isActive);
};
