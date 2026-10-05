import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectAiChatThreadToUrl: () => ({ projectAiChatThreadToUrl: jest.fn() }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useSelectAiChatThread', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it.each([AGENT_CHAT_NEW_THREAD_DRAFT_KEY, 'other-thread'])(
    'leaves onboarding when selecting %s',
    (threadId) => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
      jotaiStore.set(currentAiChatThreadState.atom, 'onboarding-thread');
      const { result } = renderHook(() => useSelectAiChatThread(), {
        wrapper: Wrapper,
      });

      act(() => result.current.selectAiChatThread(threadId));

      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(threadId);
      expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
        false,
      );
    },
  );
  it('preserves onboarding when reselecting the current setup conversation', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    jotaiStore.set(currentAiChatThreadState.atom, 'onboarding-thread');
    const { result } = renderHook(() => useSelectAiChatThread(), {
      wrapper: Wrapper,
    });

    act(() => result.current.selectAiChatThread('onboarding-thread'));

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      'onboarding-thread',
    );
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      true,
    );
  });
  it('restores usage from an archived thread and preserves it on reselection', () => {
    const thread: AgentChatThreadRecord = {
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
    setAgentChatThreadList(jotaiStore, [thread]);
    const usageAtom = agentChatUsageComponentFamilyState.atomFamily({
      instanceId: AGENT_CHAT_INSTANCE_ID,
      familyKey: { threadId: thread.id },
    });
    const { result } = renderHook(() => useSelectAiChatThread(), {
      wrapper: Wrapper,
    });
    act(() => result.current.selectAiChatThread(thread.id));
    expect(jotaiStore.get(usageAtom)).toMatchObject({
      inputTokens: 250,
      cachedInputTokens: 80,
      lastMessage: null,
    });
    const liveUsage = { ...jotaiStore.get(usageAtom)!, inputTokens: 500 };
    jotaiStore.set(usageAtom, liveUsage);
    act(() => result.current.selectAiChatThread(thread.id));
    expect(jotaiStore.get(usageAtom)).toEqual(liveUsage);
  });
});
