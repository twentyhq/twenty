import { createStore } from 'jotai';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const THREAD_ID = 'thread-1';

const getCurrentThreadData = (thread: Partial<AiChatThreadRecord> | null) => {
  const store = createStore();

  store.set(currentAiChatThreadState.atom, THREAD_ID);

  if (thread !== null) {
    store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      ...thread,
    });
  }

  return store.get(currentAiChatThreadDataSelector.atom);
};

describe('currentAiChatThreadDataSelector', () => {
  it('returns the current thread once it is fetched', () => {
    expect(
      getCurrentThreadData({
        title: 'Fetched',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
      }),
    ).toMatchObject({ id: THREAD_ID, title: 'Fetched' });
  });

  it('ignores a thread that only a live update or a favorite stored', () => {
    expect(getCurrentThreadData({ title: 'Renamed live' })).toBeUndefined();
  });

  it('returns nothing when the thread is not stored', () => {
    expect(getCurrentThreadData(null)).toBeUndefined();
  });
});
