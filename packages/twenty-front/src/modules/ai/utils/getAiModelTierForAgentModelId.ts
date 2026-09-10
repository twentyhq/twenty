import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  getAiModelTierFromModelId,
  type AiModelTier,
} from 'twenty-shared/ai';

export const getAiModelTierForAgentModelId = (
  modelId: string | null | undefined,
  workspaceAgentTier: AiModelTier,
): AiModelTier | undefined =>
  modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
    ? workspaceAgentTier
    : getAiModelTierFromModelId(modelId);
