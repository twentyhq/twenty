import { createStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatThreadHasPendingToolCallFamilySelector } from '@/ai-chat/tool-calls/states/selectors/aiChatThreadHasPendingToolCallFamilySelector';

const THREAD_ID = 'thread';

const buildAssistantMessage = (status: string): ExtendedUIMessage => ({
  id: `message-${status}`,
  role: 'assistant',
  parts: [
    {
      type: 'tool-ask_question',
      toolCallId: 'call-1',
      state: 'output-available',
      input: {
        header: 'Plan',
        question: 'Which plan?',
        options: [{ label: 'Pro' }, { label: 'Team' }],
      },
      output: { success: true, result: { status } },
    },
  ],
});

const hasPendingToolCall = (store: ReturnType<typeof createStore>) =>
  store.get(
    aiChatThreadHasPendingToolCallFamilySelector.selectorFamily({
      threadId: THREAD_ID,
    }),
  );

describe('aiChatThreadHasPendingToolCallFamilySelector', () => {
  it('is true while a question waits for an answer', () => {
    const store = createStore();

    store.set(
      aiChatThreadDisplayedMessagesFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      [buildAssistantMessage('pending')],
    );

    expect(hasPendingToolCall(store)).toBe(true);
  });

  it('is false once the question is answered', () => {
    const store = createStore();

    store.set(
      aiChatThreadDisplayedMessagesFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      [buildAssistantMessage('answered')],
    );

    expect(hasPendingToolCall(store)).toBe(false);
  });

  it('is false while the reply is still streaming', () => {
    const store = createStore();

    store.set(
      aiChatThreadDisplayedMessagesFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      [buildAssistantMessage('pending')],
    );
    store.set(
      aiChatThreadReplyStatusFamilyState.atomFamily({ threadId: THREAD_ID }),
      'streaming',
    );

    expect(hasPendingToolCall(store)).toBe(false);
  });
});
