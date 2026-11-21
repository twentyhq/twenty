import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen } from '@testing-library/react';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
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
});
