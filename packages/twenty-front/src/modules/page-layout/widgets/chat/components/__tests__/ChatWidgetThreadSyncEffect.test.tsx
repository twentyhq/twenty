import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { ChatWidgetThreadSyncEffect } from '@/page-layout/widgets/chat/components/ChatWidgetThreadSyncEffect';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const switchThreadWithDraft = jest.fn((threadId: string) => {
  jotaiStore.set(currentAiChatThreadState.atom, threadId);
});

jest.mock('@/ai/hooks/useSwitchAgentChatThreadWithDraft', () => ({
  useSwitchAgentChatThreadWithDraft: () => ({ switchThreadWithDraft }),
}));

const CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const OTHER_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';

const renderEffect = (threadId: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <ChatWidgetThreadSyncEffect threadId={threadId} />
    </JotaiProvider>,
  );

describe('ChatWidgetThreadSyncEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('opens the chat of the record the widget shows', () => {
    jotaiStore.set(currentAiChatThreadState.atom, OTHER_CHAT_ID);

    renderEffect(CHAT_ID);

    expect(switchThreadWithDraft).toHaveBeenCalledWith(CHAT_ID);
  });

  it('leaves the chat alone when it is already open', () => {
    jotaiStore.set(currentAiChatThreadState.atom, CHAT_ID);

    renderEffect(CHAT_ID);

    expect(switchThreadWithDraft).not.toHaveBeenCalled();
  });

  it('does not take the chat back after the member moves to another one', () => {
    jotaiStore.set(currentAiChatThreadState.atom, CHAT_ID);
    const { rerender } = renderEffect(CHAT_ID);

    act(() => {
      jotaiStore.set(currentAiChatThreadState.atom, OTHER_CHAT_ID);
    });
    rerender(
      <JotaiProvider store={jotaiStore}>
        <ChatWidgetThreadSyncEffect threadId={CHAT_ID} />
      </JotaiProvider>,
    );

    expect(switchThreadWithDraft).not.toHaveBeenCalled();
    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(OTHER_CHAT_ID);
  });

  it('follows the widget to another record', () => {
    jotaiStore.set(currentAiChatThreadState.atom, CHAT_ID);
    const { rerender } = renderEffect(CHAT_ID);

    rerender(
      <JotaiProvider store={jotaiStore}>
        <ChatWidgetThreadSyncEffect threadId={OTHER_CHAT_ID} />
      </JotaiProvider>,
    );

    expect(switchThreadWithDraft).toHaveBeenCalledWith(OTHER_CHAT_ID);
  });
});
