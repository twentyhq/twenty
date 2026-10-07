import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const key = {
  instanceId: 'pending-test',
  familyKey: { threadId: 'thread-id' },
};

const QUESTIONS = [{ header: 'Plan', question: 'Which plan?', options: [] }];

const questionsCall = (toolCallId: string, status: string) => ({
  type: 'tool-ask_questions',
  toolCallId,
  state: 'output-available',
  input: { questions: QUESTIONS },
  output: { success: true, result: { questions: QUESTIONS, status } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: 'pending-test' }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </Provider>
);

describe('useAgentChatPendingToolCalls', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, 'thread-id');
    jotaiStore.set(agentChatMessagesComponentFamilyState.atomFamily(key), [
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
    ] as unknown as ExtendedUIMessage[]);
  });

  it('waits on every call still pending, in the order they were made', () => {
    const { result } = renderHook(() => useAgentChatPendingToolCalls(), {
      wrapper,
    });

    expect(
      result.current.map((pendingToolCall) => pendingToolCall.toolCallId),
    ).toEqual(['call-1', 'call-2']);
  });

  it('waits on nothing while the turn is still streaming', () => {
    jotaiStore.set(
      agentChatIsStreamingComponentFamilyState.atomFamily(key),
      true,
    );

    const { result } = renderHook(() => useAgentChatPendingToolCalls(), {
      wrapper,
    });

    expect(result.current).toEqual([]);
  });
});
