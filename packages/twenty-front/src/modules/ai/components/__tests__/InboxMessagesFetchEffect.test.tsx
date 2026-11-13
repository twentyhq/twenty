import { MockedProvider } from '@apollo/client/testing/react';
import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { InboxMessagesFetchEffect } from '@/ai/components/InboxMessagesFetchEffect';
import { inboxFetchedMessagesFamilyState } from '@/ai/states/inboxFetchedMessagesFamilyState';
import { inboxLiveReactionRevisionsFamilyState } from '@/ai/states/inboxLiveReactionRevisionsFamilyState';
import { inboxMessageReactionsFamilyState } from '@/ai/states/inboxMessageReactionsFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
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

describe('InboxMessagesFetchEffect', () => {
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

    store.set(currentInboxThreadState.atom, THREAD_ID);
    store.set(
      inboxLiveReactionRevisionsFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      { [LIVE_MESSAGE_ID]: 2 },
    );
    store.set(
      inboxMessageReactionsFamilyState.atomFamily({
        messageId: LIVE_MESSAGE_ID,
      }),
      liveReactions,
    );

    render(
      <JotaiProvider store={store}>
        <MockedProvider mocks={[CHAT_MESSAGES_MOCK]}>
          <InboxMessagesFetchEffect />
        </MockedProvider>
      </JotaiProvider>,
    );

    await waitFor(() =>
      expect(
        store.get(
          inboxFetchedMessagesFamilyState.atomFamily({
            threadId: THREAD_ID,
          }),
        ),
      ).toHaveLength(2),
    );

    expect(
      store.get(
        inboxMessageReactionsFamilyState.atomFamily({
          messageId: LIVE_MESSAGE_ID,
        }),
      ),
    ).toEqual(liveReactions);
    expect(
      store.get(
        inboxMessageReactionsFamilyState.atomFamily({
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
