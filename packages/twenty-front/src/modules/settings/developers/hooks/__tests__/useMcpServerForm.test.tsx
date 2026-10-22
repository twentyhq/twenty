import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { McpServerFormMode } from '@/settings/developers/constants/McpServerFormMode';
import { CREATE_MCP_SERVER } from '@/settings/developers/graphql/mutations/createMcpServer';
import { SYNC_MCP_SERVER_TOOLS } from '@/settings/developers/graphql/mutations/syncMcpServerTools';
import { UPDATE_MCP_SERVER } from '@/settings/developers/graphql/mutations/updateMcpServer';
import { GET_MCP_SERVER } from '@/settings/developers/graphql/queries/getMcpServer';
import { useMcpServerForm } from '@/settings/developers/hooks/useMcpServerForm';

const mockNavigateSettings = jest.fn();

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const MCP_SERVER_ID = 'mcp-server-id';

const createMockMcpServer = (overrides = {}) => ({
  __typename: 'McpServer',
  id: MCP_SERVER_ID,
  name: 'docs',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
  hasAuthorizationHeader: true,
  isEnabled: true,
  tools: [
    {
      __typename: 'McpServerTool',
      name: 'search_docs',
      description: 'Search the docs',
      inputSchema: { type: 'object' },
      annotations: null,
    },
  ],
  toolsSyncedAt: '2026-10-22T08:00:00.000Z',
  toolsSyncError: null,
  applicationId: 'application-id',
  ...overrides,
});

const FORM_VALUES = {
  name: 'docs',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
  authorizationHeaderValue: '',
  shouldClearAuthorizationHeader: false,
  isEnabled: true,
};

const createGetMcpServerMock = (overrides = {}) => ({
  request: { query: GET_MCP_SERVER, variables: { id: MCP_SERVER_ID } },
  result: { data: { mcpServer: createMockMcpServer(overrides) } },
});

const Wrapper = ({
  children,
  mocks = [],
}: {
  children: ReactNode;
  mocks?: any[];
}) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

const renderForm = (
  props: Parameters<typeof useMcpServerForm>[0],
  mocks: any[] = [],
) =>
  renderHook(() => useMcpServerForm(props), {
    wrapper: ({ children }) => <Wrapper mocks={mocks}>{children}</Wrapper>,
  });

describe('useMcpServerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts enabled with empty fields in create mode', () => {
    const { result } = renderForm({ mode: McpServerFormMode.Create });

    expect(result.current.isCreationMode).toBe(true);
    expect(result.current.formConfig.getValues()).toEqual(FORM_VALUES_EMPTY);
  });

  it('creates the server, omits an empty authorization header and opens its detail page', async () => {
    const { result } = renderForm({ mode: McpServerFormMode.Create }, [
      {
        request: {
          query: CREATE_MCP_SERVER,
          variables: {
            input: {
              name: 'docs',
              label: 'Docs',
              url: 'https://docs.example.com/mcp',
              isEnabled: true,
            },
          },
        },
        result: { data: { createMcpServer: createMockMcpServer() } },
      },
    ]);

    await act(async () => {
      await result.current.handleSave(FORM_VALUES);
    });

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'success',
      children: 'MCP server Docs created successfully',
    });
    expect(mockNavigateSettings).toHaveBeenCalledWith(
      'developers/mcp-servers/:mcpServerId',
      { mcpServerId: MCP_SERVER_ID },
      undefined,
      undefined,
      undefined,
    );
  });

  it('shows the server error when creation fails', async () => {
    const { result } = renderForm({ mode: McpServerFormMode.Create }, [
      {
        request: {
          query: CREATE_MCP_SERVER,
          variables: {
            input: {
              name: 'docs',
              label: 'Docs',
              url: 'https://docs.example.com/mcp',
              isEnabled: true,
            },
          },
        },
        result: { errors: [new GraphQLError('Name already exists')] },
      },
    ]);

    await act(async () => {
      await result.current.handleSave(FORM_VALUES);
    });

    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );
    expect(mockNavigateSettings).not.toHaveBeenCalled();
  });

  it('loads the server into the form without its authorization header', async () => {
    const { result } = renderForm(
      { mode: McpServerFormMode.Edit, mcpServerId: MCP_SERVER_ID },
      [createGetMcpServerMock()],
    );

    await waitFor(() => {
      expect(result.current.mcpServer?.hasAuthorizationHeader).toBe(true);
    });

    expect(result.current.formConfig.getValues()).toEqual(FORM_VALUES);
  });

  it('clears the stored authorization header only when asked', async () => {
    const { result } = renderForm(
      { mode: McpServerFormMode.Edit, mcpServerId: MCP_SERVER_ID },
      [
        createGetMcpServerMock(),
        {
          request: {
            query: UPDATE_MCP_SERVER,
            variables: {
              input: {
                id: MCP_SERVER_ID,
                update: {
                  name: 'docs',
                  label: 'Docs renamed',
                  url: 'https://docs.example.com/mcp',
                  isEnabled: false,
                  authorizationHeaderValue: null,
                },
              },
            },
          },
          result: {
            data: {
              updateMcpServer: createMockMcpServer({
                label: 'Docs renamed',
                isEnabled: false,
                hasAuthorizationHeader: false,
              }),
            },
          },
        },
      ],
    );

    await act(async () => {
      await result.current.handleSave({
        ...FORM_VALUES,
        label: 'Docs renamed',
        isEnabled: false,
        shouldClearAuthorizationHeader: true,
      });
    });

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'success',
      children: 'MCP server Docs renamed updated successfully',
    });
  });

  it('reports the sync error returned by the server', async () => {
    const { result } = renderForm(
      { mode: McpServerFormMode.Edit, mcpServerId: MCP_SERVER_ID },
      [
        createGetMcpServerMock(),
        {
          request: {
            query: SYNC_MCP_SERVER_TOOLS,
            variables: { id: MCP_SERVER_ID },
          },
          result: {
            data: {
              syncMcpServerTools: createMockMcpServer({
                toolsSyncError: 'connect ECONNREFUSED',
              }),
            },
          },
        },
      ],
    );

    await act(async () => {
      await result.current.handleSyncTools();
    });

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'error',
      children: 'Could not refresh tools: connect ECONNREFUSED',
    });
  });
});

const FORM_VALUES_EMPTY = {
  name: '',
  label: '',
  url: '',
  authorizationHeaderValue: '',
  shouldClearAuthorizationHeader: false,
  isEnabled: true,
};
