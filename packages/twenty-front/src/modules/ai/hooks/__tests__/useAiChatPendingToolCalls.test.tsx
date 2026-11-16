import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { useAiChatPendingToolCalls } from '@/ai/hooks/useAiChatPendingToolCalls';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const key = { threadId: 'thread-id' };

const QUESTIONS = [{ header: 'Plan', question: 'Which plan?', options: [] }];

const questionsCall = (
  toolCallId: string,
  status: string,
): ExtendedUIMessagePart => ({
  type: 'tool-ask_questions',
  toolCallId,
  state: 'output-available',
  input: { questions: QUESTIONS },
  output: { success: true, result: { questions: QUESTIONS, status } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>{children}</Provider>
);

describe('useAiChatPendingToolCalls', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(aiChatDisplayedThreadState.atom, 'thread-id');
    jotaiStore.set(aiChatMessagesFamilyState.atomFamily(key), [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Two things first:' },
          questionsCall('call-answered', 'answered'),
          questionsCall('call-1', 'pending'),
          questionsCall('call-2', 'pending'),
        ],
      },
    ]);
  });

  it('waits on every call still pending, in the order they were made', () => {
    const { result } = renderHook(() => useAiChatPendingToolCalls(), {
      wrapper,
    });

    expect(
      result.current.map((pendingToolCall) => pendingToolCall.toolCallId),
    ).toEqual(['call-1', 'call-2']);
  });

  it('waits on nothing while the turn is still streaming', () => {
    jotaiStore.set(aiChatIsStreamingFamilyState.atomFamily(key), true);

    const { result } = renderHook(() => useAiChatPendingToolCalls(), {
      wrapper,
    });

    expect(result.current).toEqual([]);
  });
});
