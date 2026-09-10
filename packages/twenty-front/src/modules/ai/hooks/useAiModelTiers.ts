import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { getPercentDelta } from '@/ai/utils/getPercentDelta';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const REFERENCE_TIER: AiModelTier = 'balanced';

// Mirrors the server rule: a pin counts only while automatic selection is off
// and the pinned model is still served by the instance.
export const useAiModelTiers = (): ResolvedAiModelTier[] => {
  const aiModels = useAtomStateValue(aiModelsState);
  const aiModelTiers = useAtomStateValue(aiModelTiersState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const findModel = (modelId: string | undefined) =>
    aiModels.find((model) => model.modelId === modelId);

  const resolveModel = (tier: AiModelTier) => {
    const pinnedModelId =
      currentWorkspace?.isAutoModelSelectionEnabled === false
        ? currentWorkspace.aiModelIdByTier?.[tier]
        : undefined;
    const pinnedModel = findModel(pinnedModelId);

    if (isDefined(pinnedModel)) {
      return { model: pinnedModel, isPinned: true };
    }

    return {
      model: findModel(
        aiModelTiers.find((instanceTier) => instanceTier.tier === tier)
          ?.modelId,
      ),
      isPinned: false,
    };
  };

  const referenceModel = resolveModel(REFERENCE_TIER).model;

  return AI_MODEL_TIERS.map((tier) => {
    const { model, isPinned } = resolveModel(tier);

    return {
      tier,
      label: getAiModelTierLabel(tier),
      model,
      isPinned,
      speedDeltaPercent: getPercentDelta({
        value: model?.outputTokensPerSecond,
        reference: referenceModel?.outputTokensPerSecond,
      }),
      intelligenceDeltaPercent: getPercentDelta({
        value: model?.intelligenceIndex,
        reference: referenceModel?.intelligenceIndex,
      }),
    };
  });
};
