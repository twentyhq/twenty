import { isDefined } from 'twenty-shared/utils';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelTierForAgentModelId } from '@/ai/utils/getAiModelTierForAgentModelId';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// The concrete model an agent modelId runs on, whether it names a model, a
// tier, or the workspace default.
export const useResolvedAiModel = (
  modelId: string | null | undefined,
): ClientAiModelConfig | undefined => {
  const aiModels = useAtomStateValue(aiModelsState);
  const { agentTier } = useWorkspaceAiModelTiers();
  const tiers = useAiModelTiers();

  const tier = getAiModelTierForAgentModelId(modelId, agentTier);

  if (isDefined(tier)) {
    return tiers.find((resolvedTier) => resolvedTier.tier === tier)?.model;
  }

  return aiModels.find((model) => model.modelId === modelId);
};
