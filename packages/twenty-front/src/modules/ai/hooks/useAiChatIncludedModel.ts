import { AI_MODEL_TIERS, isIncludedAiModelVariant } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useAgentChatSelectedModelTier } from '@/ai/hooks/useAgentChatSelectedModelTier';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useHasReachedAiChatCreditsCap } from '@/ai/hooks/useHasReachedAiChatCreditsCap';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiIncludedChatModelIdState } from '@/client-config/states/aiIncludedChatModelIdState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import {
  BillingEntitlementKey,
  type ClientAiModelConfig,
} from '~/generated-metadata/graphql';

// A prediction of the server's turn plan; when it drifts, the server's refusal still renders
export const useAiChatIncludedModel = (): {
  includedModel: ClientAiModelConfig | null;
  isSelectedTierModelIncluded: boolean;
  isAutoSwitchedToIncludedModel: boolean;
  isSelectedModelIncluded: boolean;
} => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const aiIncludedChatModelId = useAtomStateValue(aiIncludedChatModelIdState);
  const aiModels = useAtomStateValue(aiModelsState);
  const tiers = useAiModelTiers();
  const { selectedTier, isFollowingWorkspaceTier } =
    useAgentChatSelectedModelTier();
  const hasReachedAiChatCreditsCap = useHasReachedAiChatCreditsCap();

  const isEntitled = checkIfBillingEntitlementIsEnabledOnWorkspace(
    BillingEntitlementKey.INCLUDED_FAST_MODEL,
    currentWorkspace,
  );

  if (!isEntitled || !isDefined(aiIncludedChatModelId)) {
    return {
      includedModel: null,
      isSelectedTierModelIncluded: false,
      isAutoSwitchedToIncludedModel: false,
      isSelectedModelIncluded: false,
    };
  }

  // Copy names this model, so one the client has no label for stays unnamed rather than shown as a raw id
  const includedModel =
    aiModels.find((model) => model.modelId === aiIncludedChatModelId) ?? null;

  const selectedTierModelId =
    tiers[AI_MODEL_TIERS.indexOf(selectedTier)]?.model?.modelId;

  const isSelectedTierModelIncluded =
    isDefined(selectedTierModelId) &&
    isIncludedAiModelVariant({
      modelId: selectedTierModelId,
      includedModelId: aiIncludedChatModelId,
    });

  const isAutoSwitchedToIncludedModel =
    !isSelectedTierModelIncluded &&
    isFollowingWorkspaceTier &&
    hasReachedAiChatCreditsCap;

  return {
    includedModel,
    isSelectedTierModelIncluded,
    isAutoSwitchedToIncludedModel,
    isSelectedModelIncluded:
      isSelectedTierModelIncluded || isAutoSwitchedToIncludedModel,
  };
};
