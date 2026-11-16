import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { isToolUIPart } from 'ai';

import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AiChatRefetchMessagesEventName';
import { useAnswerAiChatToolCall } from '@/ai/hooks/useAnswerAiChatToolCall';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mutate = jest.fn();
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ mutate }),
}));
const enqueueToast = jest.fn();
jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast }),
}));
jest.mock('@/ai/hooks/useAiChatModelId', () => ({
  useAiChatModelId: () => ({ modelIdForRequest: 'model-id' }),
}));

const key = { threadId: 'thread-id' };
const messagesAtom = aiChatMessagesFamilyState.atomFamily(key);
const isAwaitingFirstChunkAtom =
  aiChatIsAwaitingFirstChunkFamilyState.atomFamily(key);

const PENDING_OUTPUT = { result: { questions: [], status: 'pending' } };
const ANSWERED_OUTPUT = { result: { questions: [], status: 'answered' } };

const readToolOutput = () => {
  const part = jotaiStore.get(messagesAtom)[0].parts[0];

  return isToolUIPart(part) ? part.output : undefined;
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderAnswerAiChatToolCall = () =>
  renderHook(() => useAnswerAiChatToolCall(), { wrapper: Wrapper }).result
    .current.answerAiChatToolCall;

const answer = async () => {
  const answerAiChatToolCall = renderAnswerAiChatToolCall();
  let isAnswered = false;

  await act(async () => {
    isAnswered = await answerAiChatToolCall({
      toolCallId: 'call-1',
      response: { answers: [] },
      optimisticToolOutput: ANSWERED_OUTPUT,
    });
  });

  return isAnswered;
};

describe('useAnswerAiChatToolCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(aiChatDisplayedThreadState.atom, 'thread-id');
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
    ]);
  });

  it('answers the tool call and shows the answer in it right away', async () => {
    mutate.mockResolvedValue({ data: { answerToolCall: { streamId: 's' } } });

    expect(await answer()).toBe(true);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            threadId: 'thread-id',
            toolCallId: 'call-1',
            response: { answers: [] },
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
      data: { answerToolCall: { streamId: null } },
    });

    await answer();

    expect(jotaiStore.get(isAwaitingFirstChunkAtom)).toBe(false);
  });

  it('puts the tool call back as it was when the answer is refused', async () => {
    mutate.mockRejectedValue(new Error('Network down'));

    expect(await answer()).toBe(false);
    expect(readToolOutput()).toEqual(PENDING_OUTPUT);
    expect(jotaiStore.get(isAwaitingFirstChunkAtom)).toBe(false);
    expect(enqueueToast).toHaveBeenCalled();
  });

  it('refetches the conversation instead when the call was already answered elsewhere', async () => {
    const refetchListener = jest.fn();
    window.addEventListener(
      AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
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

    expect(await answer()).toBe(false);
    expect(refetchListener).toHaveBeenCalledTimes(1);
    expect(readToolOutput()).toEqual(ANSWERED_OUTPUT);

    window.removeEventListener(
      AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
  });
});
