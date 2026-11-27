import { type createStore } from 'jotai';
import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatUserSelectedModelTierState } from '@/ai-chat/states/aiChatUserSelectedModelTierState';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';

export const getAiChatModelIdForRequest = (
  store: ReturnType<typeof createStore>,
) => {
  const aiChatUserSelectedModelTier = store.get(
    aiChatUserSelectedModelTierState.atom,
  );

  if (isDefined(aiChatUserSelectedModelTier)) {
    return AUTO_SELECT_MODEL_ID_BY_TIER[aiChatUserSelectedModelTier];
  }

  return store.get(isWorkspaceSetupChatActiveState.atom)
    ? AUTO_SELECT_MODEL_ID_BY_TIER.fast
    : undefined;
};
