import { type createStore } from 'jotai';
import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiIncludedChatModelIdState } from '@/client-config/states/aiIncludedChatModelIdState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import {
  AiModelTier as AiModelTierEnum,
  BillingEntitlementKey,
  type ClientAiModelConfig,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

export const AI_CHAT_INCLUDED_TEST_MODELS = {
  included: {
    modelId: 'azure-foundry/gpt-5.6-luna@medium',
    label: 'GPT-5.6 Luna',
    sdkPackage: null,
    contextWindowTokens: 272_000,
  },
  includedAtLowerEffort: {
    modelId: 'azure-foundry/gpt-5.6-luna@low',
    label: 'GPT-5.6 Luna Low',
    sdkPackage: null,
    contextWindowTokens: 272_000,
  },
  paid: {
    modelId: 'anthropic/claude-sonnet-5@high',
    label: 'Claude Sonnet 5',
    sdkPackage: null,
    contextWindowTokens: 1_000_000,
  },
} satisfies Record<string, ClientAiModelConfig>;

export const setAiChatIncludedModelWorkspace = (
  store: ReturnType<typeof createStore>,
  {
    isEntitled = true,
    includedModelId = AI_CHAT_INCLUDED_TEST_MODELS.included.modelId,
    workspaceTier = AiModelTierEnum.fast,
    userSelectedTier = null,
    hasReachedCreditsCap = false,
    fastTierPinnedModelId,
  }: {
    isEntitled?: boolean;
    includedModelId?: string | null;
    workspaceTier?: AiModelTierEnum;
    userSelectedTier?: AiModelTier | null;
    hasReachedCreditsCap?: boolean;
    fastTierPinnedModelId?: string;
  } = {},
) => {
  const { included, includedAtLowerEffort, paid } =
    AI_CHAT_INCLUDED_TEST_MODELS;

  store.set(aiModelsState.atom, [included, includedAtLowerEffort, paid]);
  store.set(aiModelTiersState.atom, [
    { tier: AiModelTierEnum.extraFast, modelId: includedAtLowerEffort.modelId },
    { tier: AiModelTierEnum.fast, modelId: includedAtLowerEffort.modelId },
    { tier: AiModelTierEnum.balanced, modelId: paid.modelId },
    { tier: AiModelTierEnum.smart, modelId: paid.modelId },
    { tier: AiModelTierEnum.extraSmart, modelId: paid.modelId },
  ]);
  store.set(aiIncludedChatModelIdState.atom, includedModelId);
  store.set(agentChatUserSelectedModelTierState.atom, userSelectedTier);
  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    aiChatModelTier: workspaceTier,
    isAutoModelSelectionEnabled: !isDefined(fastTierPinnedModelId),
    aiModelIdByTier: isDefined(fastTierPinnedModelId)
      ? { fast: fastTierPinnedModelId }
      : {},
    billingEntitlements: [
      { key: BillingEntitlementKey.INCLUDED_FAST_MODEL, value: isEntitled },
    ],
    currentBillingSubscription: {
      ...mockCurrentWorkspace.currentBillingSubscription,
      billingSubscriptionItems:
        mockCurrentWorkspace.currentBillingSubscription.billingSubscriptionItems.map(
          (billingSubscriptionItem) => ({
            ...billingSubscriptionItem,
            hasReachedCurrentPeriodCap: hasReachedCreditsCap,
          }),
        ),
    },
  });
};
