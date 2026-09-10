import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  DEFAULT_AI_AGENT_MODEL_TIER,
  getAiModelTierFromModelId,
} from 'twenty-shared/ai';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// The concrete model an agent modelId runs on, whether it names a model, a
// tier, or the workspace default.
export const useResolvedAiModel = (
  modelId: string | null | undefined,
): ClientAiModelConfig | undefined => {
  const aiModels = useAtomStateValue(aiModelsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const tiers = useAiModelTiers();

  const tier =
    modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
      ? (currentWorkspace?.aiAgentModelTier ?? DEFAULT_AI_AGENT_MODEL_TIER)
      : getAiModelTierFromModelId(modelId);

  if (tier !== undefined) {
    return tiers.find((resolvedTier) => resolvedTier.tier === tier)?.model;
  }

  return aiModels.find((model) => model.modelId === modelId);
};
