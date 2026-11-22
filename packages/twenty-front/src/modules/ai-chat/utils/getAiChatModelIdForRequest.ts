import { type createStore } from 'jotai';
import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatUserSelectedModelTierState } from '@/ai-chat/states/aiChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';

export const getAiChatModelIdForRequest = (
  store: ReturnType<typeof createStore>,
) => {
  const aiChatUserSelectedModelTier = store.get(
    aiChatUserSelectedModelTierState.atom,
  );

  if (isDefined(aiChatUserSelectedModelTier)) {
    return AUTO_SELECT_MODEL_ID_BY_TIER[aiChatUserSelectedModelTier];
  }

  return store.get(shouldOpenAiChatAfterOnboardingState.atom)
    ? AUTO_SELECT_MODEL_ID_BY_TIER.fast
    : undefined;
};
