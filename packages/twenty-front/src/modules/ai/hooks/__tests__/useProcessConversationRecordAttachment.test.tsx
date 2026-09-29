import { gql, InMemoryCache } from '@apollo/client';
import { type MockedResponse } from '@apollo/client/testing';
import { useQuery } from '@apollo/client/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useProcessConversationRecordAttachment } from '@/ai/hooks/useProcessConversationRecordAttachment';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock(
  '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig',
  () => ({
    useObjectMorphJunctionConfig: () => ({
      junctionObjectMetadata: { namePlural: 'agentChatThreadTargets' },
    }),
  }),
);

const FIND_LINKS = gql`
  query FindManyAgentChatThreadTargets {
    agentChatThreadTargets {
      __typename
      edges {
        __typename
        node {
          __typename
          id
        }
      }
    }
  }
`;

const FIND_THREAD = gql`
  query FindOneAgentChatThread {
    agentChatThread {
      __typename
      id
      title
    }
  }
`;

const buildLinksResponse = (linkIds: string[]): MockedResponse => ({
  request: { query: FIND_LINKS },
  result: {
    data: {
      agentChatThreadTargets: {
        __typename: 'AgentChatThreadTargetConnection',
        edges: linkIds.map((id) => ({
          __typename: 'AgentChatThreadTargetEdge',
          node: { __typename: 'AgentChatThreadTarget', id },
        })),
      },
    },
  },
});

const buildThreadResponse = (title: string): MockedResponse => ({
  request: { query: FIND_THREAD },
  result: {
    data: {
      agentChatThread: {
        __typename: 'AgentChatThread',
        id: 'thread-1',
        title,
      },
    },
  },
});

const buildAttachPart = ({
  toolCallId,
  success = true,
}: {
  toolCallId: string;
  success?: boolean;
}) => ({
  type: 'tool-attach_conversation_to_record',
  toolCallId,
  input: {
    objectNameSingular: 'company',
    recordId: '20202020-0000-4000-8000-000000000001',
  },
  output: {
    success,
    message: 'Attached this conversation to the company record',
  },
  state: 'output-available',
});

const LinksList = () => {
  const { data } = useQuery<{
    agentChatThreadTargets: { edges: { node: { id: string } }[] };
  }>(FIND_LINKS, { fetchPolicy: 'cache-first' });

  return (
    <ul>
      {data?.agentChatThreadTargets.edges.map(({ node }) => (
        <li key={node.id}>{node.id}</li>
      ))}
    </ul>
  );
};

const ThreadTitle = () => {
  const { data } = useQuery<{ agentChatThread: { title: string } }>(
    FIND_THREAD,
    { fetchPolicy: 'cache-first' },
  );

  return <h1>{data?.agentChatThread.title}</h1>;
};

// Stands in for the chat stream delivering a message whose tool call
// attached the conversation on the server.
const ChatStream = ({
  isLinksListMounted,
  toolCallParts,
}: {
  isLinksListMounted: boolean;
  toolCallParts: unknown[];
}) => {
  const { processConversationRecordAttachment } =
    useProcessConversationRecordAttachment();

  return (
    <>
      <button
        onClick={() =>
          processConversationRecordAttachment({
            parts: toolCallParts,
          } as Pick<ExtendedUIMessage, 'parts'>)
        }
      >
        Deliver message
      </button>
      <ThreadTitle />
      {isLinksListMounted && <LinksList />}
    </>
  );
};

const renderChatStream = ({
  apolloMocks,
  toolCallParts,
}: {
  apolloMocks: MockedResponse[];
  toolCallParts: unknown[];
}) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    cache: new InMemoryCache(),
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataAndApolloMocksWrapper>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'processConversationRecordAttachmentTest' }}
      >
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </MetadataAndApolloMocksWrapper>
  );

  const { rerender } = render(
    <ChatStream isLinksListMounted toolCallParts={toolCallParts} />,
    { wrapper: Wrapper },
  );

  return {
    setIsLinksListMounted: (isLinksListMounted: boolean) =>
      rerender(
        <ChatStream
          isLinksListMounted={isLinksListMounted}
          toolCallParts={toolCallParts}
        />,
      ),
  };
};

describe('useProcessConversationRecordAttachment', () => {
  it('refreshes the links of a record page closed while the chat tool attached it, once it is reopened', async () => {
    const user = userEvent.setup();
    const { setIsLinksListMounted } = renderChatStream({
      apolloMocks: [
        buildThreadResponse('Pricing'),
        buildThreadResponse('Pricing'),
        buildLinksResponse(['link-before']),
        buildLinksResponse(['link-before', 'link-by-the-chat-tool']),
      ],
      toolCallParts: [buildAttachPart({ toolCallId: 'call-1' })],
    });

    expect(await screen.findByText('link-before')).toBeVisible();

    setIsLinksListMounted(false);

    await user.click(screen.getByRole('button', { name: 'Deliver message' }));

    setIsLinksListMounted(true);

    expect(await screen.findByText('link-by-the-chat-tool')).toBeVisible();
  });

  it('refreshes the open chat header once per attachment', async () => {
    const user = userEvent.setup();

    renderChatStream({
      apolloMocks: [
        buildThreadResponse('Before'),
        buildLinksResponse([]),
        buildThreadResponse('After'),
        buildLinksResponse([]),
      ],
      toolCallParts: [buildAttachPart({ toolCallId: 'call-1' })],
    });

    expect(
      await screen.findByRole('heading', { name: 'Before' }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Deliver message' }));

    expect(await screen.findByRole('heading', { name: 'After' })).toBeVisible();

    // No response is left for another refetch, so a second eviction would
    // empty the header.
    await user.click(screen.getByRole('button', { name: 'Deliver message' }));

    expect(screen.getByRole('heading', { name: 'After' })).toBeVisible();
  });

  it('leaves the cached links alone until an attachment succeeds', async () => {
    const user = userEvent.setup();
    const { setIsLinksListMounted } = renderChatStream({
      apolloMocks: [
        buildThreadResponse('Pricing'),
        buildLinksResponse(['link-before']),
      ],
      toolCallParts: [
        buildAttachPart({ toolCallId: 'failed', success: false }),
      ],
    });

    expect(await screen.findByText('link-before')).toBeVisible();

    setIsLinksListMounted(false);

    await user.click(screen.getByRole('button', { name: 'Deliver message' }));

    setIsLinksListMounted(true);

    expect(await screen.findByText('link-before')).toBeVisible();
  });
});
