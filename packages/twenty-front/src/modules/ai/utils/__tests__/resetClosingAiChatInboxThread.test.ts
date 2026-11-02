import { createStore } from 'jotai';

import { closingAiChatInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { resetClosingAiChatInboxThread } from '@/ai/utils/resetClosingAiChatInboxThread';

const CLOSED_THREAD_ID = '11111111-1111-4111-8111-111111111111';
const NEXT_THREAD_ID = '22222222-2222-4222-8222-222222222222';

describe('resetClosingAiChatInboxThread', () => {
  it('clears the closed conversation without leaving a pending reset', () => {
    const store = createStore();

    store.set(currentAiChatThreadState.atom, CLOSED_THREAD_ID);
    store.set(closingAiChatInboxThreadIdState.atom, CLOSED_THREAD_ID);
    store.set(shouldContinueAiChatInSidePanelState.atom, true);

    resetClosingAiChatInboxThread(store);

    expect(store.get(currentAiChatThreadState.atom)).toBeNull();
    expect(store.get(closingAiChatInboxThreadIdState.atom)).toBeNull();
    expect(store.get(shouldContinueAiChatInSidePanelState.atom)).toBe(false);
  });

  it('preserves a conversation selected before the closing animation finishes', () => {
    const store = createStore();

    store.set(currentAiChatThreadState.atom, NEXT_THREAD_ID);
    store.set(closingAiChatInboxThreadIdState.atom, CLOSED_THREAD_ID);

    resetClosingAiChatInboxThread(store);

    expect(store.get(currentAiChatThreadState.atom)).toBe(NEXT_THREAD_ID);
    expect(store.get(closingAiChatInboxThreadIdState.atom)).toBeNull();
  });

  it('preserves the active conversation after Ask AI consumes the pending reset', () => {
    const store = createStore();

    store.set(currentAiChatThreadState.atom, CLOSED_THREAD_ID);
    store.set(closingAiChatInboxThreadIdState.atom, CLOSED_THREAD_ID);

    resetClosingAiChatInboxThread(store);
    store.set(currentAiChatThreadState.atom, NEXT_THREAD_ID);
    store.set(shouldContinueAiChatInSidePanelState.atom, true);
    resetClosingAiChatInboxThread(store);

    expect(store.get(currentAiChatThreadState.atom)).toBe(NEXT_THREAD_ID);
    expect(store.get(shouldContinueAiChatInSidePanelState.atom)).toBe(true);
  });
});
