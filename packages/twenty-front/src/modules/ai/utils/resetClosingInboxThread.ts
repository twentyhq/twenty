import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { closingInboxThreadIdState } from '@/ai/states/closingInboxThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueInboxInSidePanelState';

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
