import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { closingAiChatInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';

export const resetClosingAiChatInboxThread = (
  store: ReturnType<typeof createStore>,
) => {
  const closingThreadId = store.get(closingAiChatInboxThreadIdState.atom);

  store.set(closingAiChatInboxThreadIdState.atom, null);

  if (
    isDefined(closingThreadId) &&
    store.get(currentAiChatThreadState.atom) === closingThreadId
  ) {
    store.set(shouldContinueAiChatInSidePanelState.atom, false);
    store.set(currentAiChatThreadState.atom, null);
  }
};
