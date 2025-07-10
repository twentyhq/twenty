import {
  AI_MODELS,
  AIModelConfig,
  DEFAULT_MODEL_ID,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

export const getDefaultModelConfig = (): AIModelConfig => {
  const defaultModel = AI_MODELS.find(
    (model) => model.modelId === DEFAULT_MODEL_ID,
  );

  if (!defaultModel) {
    throw new Error(`Default model with ID ${DEFAULT_MODEL_ID} not found`);
  }

  return defaultModel;
};
