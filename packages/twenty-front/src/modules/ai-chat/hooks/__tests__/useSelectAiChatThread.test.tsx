import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const projectAiChatThreadToUrl = jest.fn();

jest.mock('@/ai-chat/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectAiChatThreadToUrl: () => ({ projectAiChatThreadToUrl }),
}));

const ONBOARDING_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const OTHER_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const selectFromOnboardingChat = (threadId: string) => {
  window.history.pushState(null, '', `/chat/${ONBOARDING_THREAD_ID}`);
  jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

  const { result } = renderHook(() => useSelectAiChatThread(), {
    wrapper: Wrapper,
  });

  act(() => result.current.selectAiChatThread(threadId));
};

describe('useSelectAiChatThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('opens the selected chat and leaves onboarding', () => {
    selectFromOnboardingChat(OTHER_THREAD_ID);

    expect(projectAiChatThreadToUrl).toHaveBeenCalledWith(OTHER_THREAD_ID);
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('preserves onboarding when reselecting the setup conversation', () => {
    selectFromOnboardingChat(ONBOARDING_THREAD_ID);

    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      true,
    );
  });
});
