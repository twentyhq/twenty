import { createStore } from 'jotai';

import { closingInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { resetClosingInboxThread } from '@/ai/utils/resetClosingAiChatInboxThread';

const CLOSED_THREAD_ID = '11111111-1111-4111-8111-111111111111';
const NEXT_THREAD_ID = '22222222-2222-4222-8222-222222222222';

describe('resetClosingInboxThread', () => {
  it('clears the closed conversation without leaving a pending reset', () => {
    const store = createStore();

    store.set(currentInboxThreadState.atom, CLOSED_THREAD_ID);
    store.set(closingInboxThreadIdState.atom, CLOSED_THREAD_ID);
    store.set(shouldContinueInboxInSidePanelState.atom, true);

    resetClosingInboxThread(store);

    expect(store.get(currentInboxThreadState.atom)).toBeNull();
    expect(store.get(closingInboxThreadIdState.atom)).toBeNull();
    expect(store.get(shouldContinueInboxInSidePanelState.atom)).toBe(false);
  });

  it('preserves a conversation selected before the closing animation finishes', () => {
    const store = createStore();

    store.set(currentInboxThreadState.atom, NEXT_THREAD_ID);
    store.set(closingInboxThreadIdState.atom, CLOSED_THREAD_ID);

    resetClosingInboxThread(store);

    expect(store.get(currentInboxThreadState.atom)).toBe(NEXT_THREAD_ID);
    expect(store.get(closingInboxThreadIdState.atom)).toBeNull();
  });

  it('preserves the active conversation after Ask AI consumes the pending reset', () => {
    const store = createStore();

    store.set(currentInboxThreadState.atom, CLOSED_THREAD_ID);
    store.set(closingInboxThreadIdState.atom, CLOSED_THREAD_ID);

    resetClosingInboxThread(store);
    store.set(currentInboxThreadState.atom, NEXT_THREAD_ID);
    store.set(shouldContinueInboxInSidePanelState.atom, true);
    resetClosingInboxThread(store);

    expect(store.get(currentInboxThreadState.atom)).toBe(NEXT_THREAD_ID);
    expect(store.get(shouldContinueInboxInSidePanelState.atom)).toBe(true);
  });
});
