import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const switchToNewChatMock = jest.fn();

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({
    switchToNewChat: switchToNewChatMock,
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAskAiPageWithPreprompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(agentChatDraftsByThreadIdState.atom, {});
    jotaiStore.set(agentChatPrepromptState.atom, null);
  });

  it('should seed the new thread draft and default to PREFILL mode', () => {
    const { result } = renderHook(() => useOpenAskAiPageWithPreprompt(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPageWithPreprompt({ text: 'Summarize this' });
    });

    expect(
      jotaiStore.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ],
    ).toBe('Summarize this');
    expect(jotaiStore.get(agentChatPrepromptState.atom)).toEqual({
      text: 'Summarize this',
      mode: 'PREFILL',
    });
    expect(switchToNewChatMock).toHaveBeenCalledTimes(1);
  });

  it('should store the SEND mode when provided', () => {
    const { result } = renderHook(() => useOpenAskAiPageWithPreprompt(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPageWithPreprompt({
        text: 'What are my open deals?',
        mode: 'SEND',
      });
    });

    expect(jotaiStore.get(agentChatPrepromptState.atom)).toEqual({
      text: 'What are my open deals?',
      mode: 'SEND',
    });
    expect(switchToNewChatMock).toHaveBeenCalledTimes(1);
  });

  it('should seed the draft after switching so the preprompt is not clobbered when already on the new thread draft', () => {
    // Reproduce switchThreadWithDraft re-saving the current editor input into
    // the new-thread draft when already on it.
    switchToNewChatMock.mockImplementation(() => {
      jotaiStore.set(agentChatDraftsByThreadIdState.atom, (prev) => ({
        ...prev,
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: 'stale editor content',
      }));
    });

    const { result } = renderHook(() => useOpenAskAiPageWithPreprompt(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPageWithPreprompt({
        text: 'Draft an email',
        mode: 'SEND',
      });
    });

    expect(
      jotaiStore.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ],
    ).toBe('Draft an email');
  });
});
