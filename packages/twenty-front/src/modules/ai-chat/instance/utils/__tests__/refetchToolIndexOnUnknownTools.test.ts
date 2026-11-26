import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import {
  type ExtendedUIMessage,
  PROPOSE_TOOL_CALL_TOOL_NAME,
} from 'twenty-shared/ai';

import { refetchToolIndexOnUnknownTools } from '@/ai-chat/instance/utils/refetchToolIndexOnUnknownTools';
import { invalidateToolIndex } from '@/ai/utils/invalidateToolIndex';
import { GetToolIndexDocument } from '~/generated-metadata/graphql';

jest.mock('@/ai/utils/invalidateToolIndex', () => ({
  invalidateToolIndex: jest.fn(() => Promise.resolve()),
}));

const buildApolloClientWithToolIndex = (toolNames: string[]) => {
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });

  apolloClient.writeQuery({
    query: GetToolIndexDocument,
    data: {
      getToolIndex: toolNames.map((name) => ({
        __typename: 'ToolIndexEntry' as const,
        name,
        label: name,
        description: '',
        category: 'LOGIC_FUNCTION',
        objectName: null,
        icon: null,
        widgetName: null,
        frontComponentId: null,
        approval: null,
      })),
    },
  });

  return apolloClient;
};

const buildProposalMessage = ({
  proposedToolName,
  state = 'input-available',
}: {
  proposedToolName: string;
  state?: 'input-streaming' | 'input-available';
}): ExtendedUIMessage => ({
  id: `message-${proposedToolName}`,
  role: 'assistant',
  parts: [
    {
      type: `tool-${PROPOSE_TOOL_CALL_TOOL_NAME}`,
      toolCallId: `call-${proposedToolName}`,
      state,
      input: {
        toolName: proposedToolName,
        arguments: {},
        summary: 'Meeting request from Maya',
      },
    },
  ],
});

describe('refetchToolIndexOnUnknownTools', () => {
  beforeEach(() => {
    jest.mocked(invalidateToolIndex).mockClear();
  });

  it('refetches the tool index for a proposed tool it does not list yet', () => {
    const apolloClient = buildApolloClientWithToolIndex([
      'app_tool_respond_to_cal_booking',
    ]);

    refetchToolIndexOnUnknownTools({
      apolloClient,
      messages: [
        buildProposalMessage({
          proposedToolName: 'app_tool_respond_to_cal_booking',
        }),
      ],
    });
    refetchToolIndexOnUnknownTools({
      apolloClient,
      messages: [
        buildProposalMessage({
          proposedToolName: 'app_tool_newly_installed',
        }),
      ],
    });

    expect(invalidateToolIndex).toHaveBeenCalledTimes(2);
  });

  it('does not refetch for a proposed tool the index already lists', () => {
    const apolloClient = buildApolloClientWithToolIndex([
      PROPOSE_TOOL_CALL_TOOL_NAME,
      'app_tool_respond_to_cal_booking',
    ]);

    refetchToolIndexOnUnknownTools({
      apolloClient,
      messages: [
        buildProposalMessage({
          proposedToolName: 'app_tool_respond_to_cal_booking',
        }),
      ],
    });

    expect(invalidateToolIndex).not.toHaveBeenCalled();
  });

  it('ignores the partial tool name of a proposal still streaming', () => {
    const apolloClient = buildApolloClientWithToolIndex([
      PROPOSE_TOOL_CALL_TOOL_NAME,
      'app_tool_respond_to_cal_booking',
    ]);

    refetchToolIndexOnUnknownTools({
      apolloClient,
      messages: [
        buildProposalMessage({
          proposedToolName: 'app_tool_res',
          state: 'input-streaming',
        }),
      ],
    });

    expect(invalidateToolIndex).not.toHaveBeenCalled();
  });
});
