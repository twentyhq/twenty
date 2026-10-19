import { MockedProvider } from '@apollo/client/testing/react';
import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { agentChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatLiveReactionRevisionsFamilyState } from '@/ai/states/agentChatLiveReactionRevisionsFamilyState';
import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { GetChatMessagesDocument } from '~/generated-metadata/graphql';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const LIVE_MESSAGE_ID = '20202020-0000-4000-8000-0000000000bb';
const FETCHED_MESSAGE_ID = '20202020-0000-4000-8000-0000000000cc';

const buildFetchedMessage = (id: string) => ({
  __typename: 'AgentMessage',
  id,
  threadId: THREAD_ID,
  turnId: null,
  senderWorkspaceMemberId: null,
  role: 'user',
  status: null,
  createdAt: '2026-10-01T10:00:00.000Z',
  processedAt: null,
  parts: [],
  reactions: [
    {
      __typename: 'AgentMessageReactionSummary',
      emoji: '👍',
      workspaceMemberIds: ['julia'],
      agentIds: [],
      hasAssistantReacted: false,
    },
  ],
});

const CHAT_MESSAGES_MOCK = {
  request: {
    query: GetChatMessagesDocument,
    variables: { threadId: THREAD_ID },
  },
  result: {
    data: {
      chatMessages: [
        buildFetchedMessage(LIVE_MESSAGE_ID),
        buildFetchedMessage(FETCHED_MESSAGE_ID),
      ],
      chatStreamCatchupChunks: null,
    },
  },
};

describe('AgentChatMessagesFetchEffect', () => {
  it('keeps reactions received live over the ones a fetch read', async () => {
    const store = createStore();
    const liveReactions = [
      {
        emoji: '👍',
        workspaceMemberIds: ['julia'],
        agentIds: [],
        hasAssistantReacted: false,
      },
      {
        emoji: '🎉',
        workspaceMemberIds: ['tom'],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ];

    store.set(currentAiChatThreadState.atom, THREAD_ID);
    store.set(
      agentChatLiveReactionRevisionsFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      { [LIVE_MESSAGE_ID]: 2 },
    );
    store.set(
      agentChatMessageReactionsFamilyState.atomFamily({
        messageId: LIVE_MESSAGE_ID,
      }),
      liveReactions,
    );

    render(
      <JotaiProvider store={store}>
        <MockedProvider mocks={[CHAT_MESSAGES_MOCK]}>
          <AgentChatMessagesFetchEffect />
        </MockedProvider>
      </JotaiProvider>,
    );

    await waitFor(() =>
      expect(
        store.get(
          agentChatFetchedMessagesFamilyState.atomFamily({
            threadId: THREAD_ID,
          }),
        ),
      ).toHaveLength(2),
    );

    expect(
      store.get(
        agentChatMessageReactionsFamilyState.atomFamily({
          messageId: LIVE_MESSAGE_ID,
        }),
      ),
    ).toEqual(liveReactions);
    expect(
      store.get(
        agentChatMessageReactionsFamilyState.atomFamily({
          messageId: FETCHED_MESSAGE_ID,
        }),
      ),
    ).toEqual([
      expect.objectContaining({
        emoji: '👍',
        workspaceMemberIds: ['julia'],
        agentIds: [],
        hasAssistantReacted: false,
      }),
    ]);
  });
});
