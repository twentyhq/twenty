import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  getAiModelTierFromModelId,
  type AiModelTier,
} from 'twenty-shared/ai';

// An agent id names the workspace default, a tier of its own, or a concrete
// model, in which case there is no tier to report.
export const getAiModelTierForAgentModelId = (
  modelId: string | null | undefined,
  workspaceAgentTier: AiModelTier,
): AiModelTier | undefined =>
  modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
    ? workspaceAgentTier
    : getAiModelTierFromModelId(modelId);
