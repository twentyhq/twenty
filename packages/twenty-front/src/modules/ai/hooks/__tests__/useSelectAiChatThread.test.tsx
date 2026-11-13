import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { setInboxThreadList } from '@/ai/testing/setAgentChatThreadList';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSelectInboxThread } from '@/ai/hooks/useSelectAiChatThread';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectInboxThreadToUrl: () => ({ projectInboxThreadToUrl: jest.fn() }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useSelectInboxThread', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it.each(['new-chat-thread', 'other-thread'])(
    'leaves onboarding when selecting %s',
    (threadId) => {
      jotaiStore.set(shouldOpenInboxAfterOnboardingState.atom, true);
      jotaiStore.set(currentInboxThreadState.atom, 'onboarding-thread');
      const { result } = renderHook(() => useSelectInboxThread(), {
        wrapper: Wrapper,
      });

      act(() => result.current.selectInboxThread(threadId));

      expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(threadId);
      expect(jotaiStore.get(shouldOpenInboxAfterOnboardingState.atom)).toBe(
        false,
      );
    },
  );
  it('preserves onboarding when reselecting the current setup conversation', () => {
    jotaiStore.set(shouldOpenInboxAfterOnboardingState.atom, true);
    jotaiStore.set(currentInboxThreadState.atom, 'onboarding-thread');
    const { result } = renderHook(() => useSelectInboxThread(), {
      wrapper: Wrapper,
    });

    act(() => result.current.selectInboxThread('onboarding-thread'));

    expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(
      'onboarding-thread',
    );
    expect(jotaiStore.get(shouldOpenInboxAfterOnboardingState.atom)).toBe(true);
  });
  it('restores usage from an archived thread and preserves it on reselection', () => {
    const thread: InboxThreadRecord = {
      __typename: 'AgentChatThread',
      id: 'archived-thread',
      title: null,
      deletedAt: '2026-09-01',
      createdAt: '2026-08-01',
      updatedAt: '2026-09-01',
      conversationSize: 120,
      contextWindowTokens: 1000,
      totalInputTokens: 250,
      totalOutputTokens: 30,
      totalCacheReadTokens: 80,
      totalInputCredits: 125000,
      totalOutputCredits: 50000,
    };
    setInboxThreadList(jotaiStore, [thread]);
    const usageAtom = agentChatUsageFamilyState.atomFamily({
      threadId: thread.id,
    });
    const { result } = renderHook(() => useSelectInboxThread(), {
      wrapper: Wrapper,
    });
    act(() => result.current.selectInboxThread(thread.id));
    expect(jotaiStore.get(usageAtom)).toMatchObject({
      inputTokens: 250,
      cachedInputTokens: 80,
      lastMessage: null,
    });
    const liveUsage = { ...jotaiStore.get(usageAtom)!, inputTokens: 500 };
    jotaiStore.set(usageAtom, liveUsage);
    act(() => result.current.selectInboxThread(thread.id));
    expect(jotaiStore.get(usageAtom)).toEqual(liveUsage);
  });
});
