import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen, waitFor } from '@testing-library/react';

import { AgentChatToolIndexInvalidationEffect } from '@/ai/components/AgentChatToolIndexInvalidationEffect';
import { TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS } from '@/ai/constants/ToolIndexInvalidationDebounceTimeInMs';
import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { GetToolIndexDocument } from '~/generated-metadata/graphql';

const TOOL_LABEL = 'Find companies';

const toolIndexResult = jest.fn(() => ({
  data: {
    getToolIndex: [
      {
        __typename: 'ToolIndexEntry' as const,
        name: 'find_companies',
        label: TOOL_LABEL,
        description: 'Search companies',
        category: 'DATABASE_CRUD',
        objectName: 'company',
        icon: null,
        widgetName: null,
        frontComponentId: null,
      },
    ],
  },
}));

const TOOL_INDEX_MOCKS = [1, 2, 3].map(() => ({
  request: { query: GetToolIndexDocument },
  delay: 0,
  result: toolIndexResult,
}));

const ToolStepLabel = () => {
  const { toolIndex } = useGetToolIndex();

  return <span>{toolIndex[0]?.label}</span>;
};

// Mirrors the metadata client, whose default policy is cache-and-network
const buildChat = (toolStepCount: number) => (
  <MockedProvider
    mocks={TOOL_INDEX_MOCKS}
    defaultOptions={{ watchQuery: { fetchPolicy: 'cache-and-network' } }}
  >
    <>
      <AgentChatToolIndexInvalidationEffect />
      {Array.from({ length: toolStepCount }, (_, index) => (
        <ToolStepLabel key={index} />
      ))}
    </>
  </MockedProvider>
);

const wait = (durationInMs: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, durationInMs));
  });

const flushPendingRequests = () => wait(0);

const waitPastInvalidationDebounce = () =>
  wait(TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS + 100);

const dispatchMetadataUpdate = (metadataName: 'objectMetadata' | 'view') =>
  act(() => {
    dispatchMetadataOperationBrowserEvent({
      metadataName,
      operation: { type: 'update', updatedRecord: { id: 'record-id' } },
    });
  });

describe('useGetToolIndex', () => {
  beforeEach(() => {
    toolIndexResult.mockClear();
  });

  it('should fetch the tool index once while tool steps keep mounting', async () => {
    const { rerender } = render(buildChat(1));

    await screen.findByText(TOOL_LABEL);

    rerender(buildChat(3));

    expect(await screen.findAllByText(TOOL_LABEL)).toHaveLength(3);
    await flushPendingRequests();
    expect(toolIndexResult).toHaveBeenCalledTimes(1);
  });

  it('should fetch the tool index again when something it is built from changes', async () => {
    render(buildChat(2));

    await screen.findAllByText(TOOL_LABEL);

    dispatchMetadataUpdate('objectMetadata');

    await waitFor(() => expect(toolIndexResult).toHaveBeenCalledTimes(2));
    await flushPendingRequests();
    expect(toolIndexResult).toHaveBeenCalledTimes(2);
  });

  it('should fetch the tool index once after a burst of changes', async () => {
    render(buildChat(2));

    await screen.findAllByText(TOOL_LABEL);

    dispatchMetadataUpdate('objectMetadata');
    dispatchMetadataUpdate('objectMetadata');
    dispatchMetadataUpdate('objectMetadata');
    await flushPendingRequests();

    expect(toolIndexResult).toHaveBeenCalledTimes(1);

    await waitPastInvalidationDebounce();
    await flushPendingRequests();

    expect(toolIndexResult).toHaveBeenCalledTimes(2);
  });

  it('should keep the cached tool index when unrelated metadata changes', async () => {
    render(buildChat(2));

    await screen.findAllByText(TOOL_LABEL);

    dispatchMetadataUpdate('view');
    await waitPastInvalidationDebounce();

    expect(toolIndexResult).toHaveBeenCalledTimes(1);
  });
});
