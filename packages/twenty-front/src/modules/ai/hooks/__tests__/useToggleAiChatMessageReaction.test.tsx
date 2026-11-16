import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useToggleAiChatMessageReaction } from '@/ai/hooks/useToggleAiChatMessageReaction';
import { aiChatLiveReactionRevisionsFamilyState } from '@/ai/states/aiChatLiveReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai/states/aiChatMessageReactionsFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

const THREAD_ID = 'thread-id';
const MESSAGE_ID = 'message-id';
const WORKSPACE_MEMBER_ID = 'julia';

const mutate = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ mutate }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
}));

const renderToggleReaction = () => {
  const store = createStore();

  store.set(currentWorkspaceMemberState.atom, {
    id: WORKSPACE_MEMBER_ID,
  } as never);
  store.set(currentAiChatThreadState.atom, THREAD_ID);

  const { result } = renderHook(() => useToggleAiChatMessageReaction(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

  const getReactions = () =>
    store.get(
      aiChatMessageReactionsFamilyState.atomFamily({
        messageId: MESSAGE_ID,
      }),
    );

  return { result, getReactions, store };
};

describe('useToggleAiChatMessageReaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('takes back only the refused reaction when another one was added meanwhile', async () => {
    let refuseThumbsUp: (error: Error) => void = () => undefined;

    mutate
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          refuseThumbsUp = reject;
        }),
      )
      .mockResolvedValueOnce({ data: {} });

    const { result, getReactions } = renderToggleReaction();

    let thumbsUpToggle: Promise<void> = Promise.resolve();

    await act(async () => {
      thumbsUpToggle = result.current.toggleAiChatMessageReaction({
        messageId: MESSAGE_ID,
        emoji: '👍',
      });
      await result.current.toggleAiChatMessageReaction({
        messageId: MESSAGE_ID,
        emoji: '🎉',
      });
    });

    expect(getReactions()).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [WORKSPACE_MEMBER_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
      {
        emoji: '🎉',
        workspaceMemberIds: [WORKSPACE_MEMBER_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);

    await act(async () => {
      refuseThumbsUp(new Error('Network error'));
      await thumbsUpToggle;
    });

    expect(getReactions()).toEqual([
      {
        emoji: '🎉',
        workspaceMemberIds: [WORKSPACE_MEMBER_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);
    expect(enqueueToast).toHaveBeenCalledTimes(1);
  });

  it('sends changes to one emoji in order and keeps the newest choice when an older one fails', async () => {
    let refuseAdd: (error: Error) => void = () => undefined;

    mutate
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          refuseAdd = reject;
        }),
      )
      .mockResolvedValueOnce({ data: {} });

    const { result, getReactions } = renderToggleReaction();

    let addToggle: Promise<void> = Promise.resolve();
    let removeToggle: Promise<void> = Promise.resolve();

    await act(async () => {
      addToggle = result.current.toggleAiChatMessageReaction({
        messageId: MESSAGE_ID,
        emoji: '👍',
      });
      removeToggle = result.current.toggleAiChatMessageReaction({
        messageId: MESSAGE_ID,
        emoji: '👍',
      });
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(getReactions()).toEqual([]);

    await act(async () => {
      refuseAdd(new Error('Network error'));
      await Promise.all([addToggle, removeToggle]);
    });

    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[1][0].variables).toEqual({
      messageId: MESSAGE_ID,
      emoji: '👍',
    });
    expect(getReactions()).toEqual([]);
    expect(enqueueToast).toHaveBeenCalledTimes(1);
  });

  it('keeps the state a live snapshot showed when the request then fails', async () => {
    let failAdd: (error: Error) => void = () => undefined;

    mutate.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failAdd = reject;
      }),
    );

    const { result, getReactions, store } = renderToggleReaction();
    const confirmedReactions = [
      {
        emoji: '👍',
        workspaceMemberIds: [WORKSPACE_MEMBER_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ];

    let addToggle: Promise<void> = Promise.resolve();

    await act(async () => {
      addToggle = result.current.toggleAiChatMessageReaction({
        messageId: MESSAGE_ID,
        emoji: '👍',
      });
    });

    await act(async () => {
      store.set(
        aiChatLiveReactionRevisionsFamilyState.atomFamily({
          threadId: THREAD_ID,
        }),
        { [MESSAGE_ID]: 1 },
      );
      store.set(
        aiChatMessageReactionsFamilyState.atomFamily({
          messageId: MESSAGE_ID,
        }),
        confirmedReactions,
      );
      failAdd(new Error('Network error'));
      await addToggle;
    });

    expect(getReactions()).toEqual(confirmedReactions);
    expect(enqueueToast).toHaveBeenCalledTimes(1);
  });
});
