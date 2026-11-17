import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { closingAiChatThreadIdState } from '@/ai/states/closingAiChatThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';

export const resetClosingInboxThread = (
  store: ReturnType<typeof createStore>,
) => {
  const closingThreadId = store.get(closingAiChatThreadIdState.atom);

  store.set(closingAiChatThreadIdState.atom, null);

  if (
    isDefined(closingThreadId) &&
    store.get(currentAiChatThreadState.atom) === closingThreadId
  ) {
    store.set(shouldContinueAiChatInSidePanelState.atom, false);
    store.set(currentAiChatThreadState.atom, null);
  }
};
