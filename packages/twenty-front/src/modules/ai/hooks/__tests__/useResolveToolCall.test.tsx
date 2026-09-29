import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useResolveToolCall } from '@/ai/hooks/useResolveToolCall';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mutate = jest.fn();
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ mutate }),
}));
const enqueueToast = jest.fn();
jest.mock('twenty-ui/components', () => ({
  useToast: () => ({ enqueueToast }),
}));
jest.mock('@/ai/hooks/useAgentChatModelId', () => ({
  useAgentChatModelId: () => ({ modelIdForRequest: 'model-id' }),
}));

const key = {
  instanceId: AGENT_CHAT_INSTANCE_ID,
  familyKey: { threadId: 'thread-id' },
};
const messagesAtom = agentChatMessagesComponentFamilyState.atomFamily(key);
const isAwaitingFirstChunkAtom =
  agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily(key);

const PENDING_OUTPUT = { result: { questions: [], status: 'pending' } };
const ANSWERED_OUTPUT = { result: { questions: [], status: 'answered' } };

const readToolOutput = () =>
  (
    jotaiStore.get(messagesAtom)[0].parts[0] as unknown as {
      output: unknown;
    }
  ).output;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderResolveToolCall = () =>
  renderHook(() => useResolveToolCall(), { wrapper: Wrapper }).result.current
    .resolveToolCall;

const resolve = async () => {
  const resolveToolCall = renderResolveToolCall();
  let isResolved = false;

  await act(async () => {
    isResolved = await resolveToolCall({
      toolCallId: 'call-1',
      output: { answers: [] },
      optimisticToolOutput: ANSWERED_OUTPUT,
    });
  });

  return isResolved;
};

describe('useResolveToolCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, 'thread-id');
    jotaiStore.set(messagesAtom, [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-ask_questions',
            toolCallId: 'call-1',
            state: 'output-available',
            input: { questions: [] },
            output: PENDING_OUTPUT,
          },
        ],
      },
    ] as unknown as ExtendedUIMessage[]);
  });

  it('resolves the call on the displayed thread and shows the answer right away', async () => {
    mutate.mockResolvedValue({ data: { resolveToolCall: { streamId: 's' } } });

    expect(await resolve()).toBe(true);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            threadId: 'thread-id',
            toolCallId: 'call-1',
            output: { answers: [] },
            modelId: 'model-id',
          },
        },
      }),
    );
    expect(readToolOutput()).toEqual(ANSWERED_OUTPUT);
    expect(jotaiStore.get(isAwaitingFirstChunkAtom)).toBe(true);
  });

  it('expects no stream when the answer resumes a workflow run', async () => {
    mutate.mockResolvedValue({
      data: { resolveToolCall: { streamId: null } },
    });

    await resolve();

    expect(jotaiStore.get(isAwaitingFirstChunkAtom)).toBe(false);
  });

  it('puts the call back as it was when the answer is refused', async () => {
    mutate.mockRejectedValue(new Error('Network down'));

    expect(await resolve()).toBe(false);
    expect(readToolOutput()).toEqual(PENDING_OUTPUT);
    expect(jotaiStore.get(isAwaitingFirstChunkAtom)).toBe(false);
    expect(enqueueToast).toHaveBeenCalled();
  });

  it('refetches the conversation instead when the call was already resolved elsewhere', async () => {
    const refetchListener = jest.fn();
    window.addEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
    mutate.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'No longer waiting',
            extensions: { code: 'TOOL_CALL_NOT_PENDING' },
          },
        ],
      }),
    );

    expect(await resolve()).toBe(false);
    expect(refetchListener).toHaveBeenCalledTimes(1);
    expect(readToolOutput()).toEqual(ANSWERED_OUTPUT);

    window.removeEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
  });
});
