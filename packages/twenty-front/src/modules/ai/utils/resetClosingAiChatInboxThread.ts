import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { closingInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';

export const resetClosingInboxThread = (
  store: ReturnType<typeof createStore>,
) => {
  const closingThreadId = store.get(closingInboxThreadIdState.atom);

  store.set(closingInboxThreadIdState.atom, null);

  if (
    isDefined(closingThreadId) &&
    store.get(currentInboxThreadState.atom) === closingThreadId
  ) {
    store.set(shouldContinueInboxInSidePanelState.atom, false);
    store.set(currentInboxThreadState.atom, null);
  }
};
