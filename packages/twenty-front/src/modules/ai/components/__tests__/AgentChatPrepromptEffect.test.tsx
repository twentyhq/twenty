import { act, render, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatPrepromptEffect } from '@/ai/components/AgentChatPrepromptEffect';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const listenToEvent = (eventName: string) => {
  const listener = jest.fn();
  window.addEventListener(eventName, listener);

  return listener;
};

const stagePreprompt = ({
  text,
  mode,
}: {
  text: string;
  mode: AgentChatPrepromptMode;
}) => {
  const { result } = renderHook(() => useStageAiChatPreprompt(), {
    wrapper: Wrapper,
  });

  act(() => {
    result.current.stageAiChatPreprompt({
      text,
      mode,
      draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  });
};

describe('AgentChatPrepromptEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    resetJotaiStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should send the preprompt and clear the composer in SEND mode', () => {
    const sendListener = listenToEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);
    const restoreListener = listenToEvent(
      AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
    );
    render(<AgentChatPrepromptEffect />, { wrapper: Wrapper });
    stagePreprompt({ text: 'What can you do?', mode: 'SEND' });
    act(() => {
      jest.runAllTimers();
    });

    expect(sendListener).toHaveBeenCalled();
    expect(restoreListener.mock.calls[0][0].detail).toEqual({ content: '' });
    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(false);
    expect(jotaiStore.get(agentChatPrepromptState.atom)).toBeNull();
  });

  it('should fill the composer and ask for focus in PREFILL mode', () => {
    const sendListener = listenToEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);
    const restoreListener = listenToEvent(
      AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
    );
    render(<AgentChatPrepromptEffect />, { wrapper: Wrapper });
    stagePreprompt({ text: 'Create a workflow that ', mode: 'PREFILL' });
    act(() => {
      jest.runAllTimers();
    });

    expect(sendListener).not.toHaveBeenCalled();
    expect(restoreListener.mock.calls[0][0].detail.content).toContain(
      'Create a workflow that ',
    );
    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(true);
    expect(jotaiStore.get(agentChatPrepromptState.atom)).toBeNull();
  });
});
