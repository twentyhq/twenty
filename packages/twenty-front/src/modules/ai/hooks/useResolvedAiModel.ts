import { isDefined } from 'twenty-shared/utils';
import { parseAiModelVariantId } from 'twenty-shared/ai';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelTierForAgentModelId } from '@/ai/utils/getAiModelTierForAgentModelId';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

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

  const { modelId: baseModelId } = parseAiModelVariantId(modelId ?? '');

  return (
    aiModels.find((model) => model.modelId === modelId) ??
    aiModels.find((model) => model.modelId === baseModelId)
  );
};
