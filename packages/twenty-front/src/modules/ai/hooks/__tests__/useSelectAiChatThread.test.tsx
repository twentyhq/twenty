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
});
