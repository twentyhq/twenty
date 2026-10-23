import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
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
jest.mock('@/ai/hooks/useAgentChatModelId', () => ({
  useAgentChatModelId: () => ({ modelIdForRequest: 'model-id' }),
}));

const key = { threadId: 'thread-id' };
const messagesAtom = agentChatMessagesFamilyState.atomFamily(key);
const isAwaitingFirstChunkAtom =
  agentChatIsAwaitingFirstChunkFamilyState.atomFamily(key);

const PENDING_OUTPUT = { result: { questions: [], status: 'pending' } };
const ANSWERED_OUTPUT = { result: { questions: [], status: 'answered' } };
const MENTIONED_PARTICIPANT = {
  id: 'participant-id',
  threadId: 'thread-id',
  isSubscribed: true,
  lastMentionedAt: '2026-10-01T10:00:00.000Z',
  lastResolvedMentionAt: null,
  updatedAt: '2026-10-01T10:00:00.000Z',
};

const readToolOutput = () =>
  (
    jotaiStore.get(messagesAtom)[0].parts[0] as unknown as {
      output: unknown;
    }
  ).output;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderAnswerAgentChatToolCall = () =>
  renderHook(() => useAnswerAgentChatToolCall(), { wrapper: Wrapper }).result
    .current.answerAgentChatToolCall;

const answer = async () => {
  const answerAgentChatToolCall = renderAnswerAgentChatToolCall();
  let isAnswered = false;

  await act(async () => {
    isAnswered = await answerAgentChatToolCall({
      toolCallId: 'call-1',
      response: { answers: [] },
      optimisticToolOutput: ANSWERED_OUTPUT,
    });
  });

  return isAnswered;
};

describe('useAnswerAgentChatToolCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, 'thread-id');
    jotaiStore.set(agentChatThreadParticipantsState.atom, {
      'thread-id': MENTIONED_PARTICIPANT,
    });
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
    expect(
      jotaiStore.get(agentChatThreadParticipantsState.atom)?.['thread-id']
        .lastResolvedMentionAt,
    ).toBe(MENTIONED_PARTICIPANT.lastMentionedAt);
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
    expect(
      jotaiStore.get(agentChatThreadParticipantsState.atom)?.['thread-id']
        .lastResolvedMentionAt,
    ).toBeNull();
  });

  it('preserves a new mention arriving while an answer is submitted', async () => {
    const newMentionedAt = '2026-10-01T10:01:00.000Z';

    mutate.mockImplementation(async () => {
      jotaiStore.set(agentChatThreadParticipantsState.atom, {
        'thread-id': {
          ...MENTIONED_PARTICIPANT,
          lastMentionedAt: newMentionedAt,
          updatedAt: newMentionedAt,
        },
      });

      return { data: { answerToolCall: { streamId: null } } };
    });

    expect(await answer()).toBe(true);
    expect(
      jotaiStore.get(agentChatThreadParticipantsState.atom)?.['thread-id'],
    ).toMatchObject({
      lastMentionedAt: newMentionedAt,
      lastResolvedMentionAt: MENTIONED_PARTICIPANT.lastMentionedAt,
    });
  });

  it('preserves the accepted response event when a later server step fails', async () => {
    const resolvedParticipant = {
      ...MENTIONED_PARTICIPANT,
      lastResolvedMentionAt: MENTIONED_PARTICIPANT.lastMentionedAt,
    };

    mutate.mockImplementation(async () => {
      jotaiStore.set(agentChatThreadParticipantsState.atom, {
        'thread-id': resolvedParticipant,
      });

      throw new Error('Notification failed');
    });

    expect(await answer()).toBe(false);
    expect(
      jotaiStore.get(agentChatThreadParticipantsState.atom)?.['thread-id'],
    ).toEqual(resolvedParticipant);
  });

  it('refetches the conversation instead when the call was already answered elsewhere', async () => {
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

    expect(await answer()).toBe(false);
    expect(refetchListener).toHaveBeenCalledTimes(1);
    expect(readToolOutput()).toEqual(ANSWERED_OUTPUT);

    window.removeEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
  });
});
