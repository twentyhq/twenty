import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionMcpTool } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/components/WorkflowEditActionMcpTool';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { type FunctionInput } from 'twenty-shared/workflow';

const mockUseFindManyMcpServers = jest.fn();

jest.mock('@/mcp-servers/hooks/useFindManyMcpServers', () => ({
  useFindManyMcpServers: () => mockUseFindManyMcpServers(),
}));

const MCP_SERVERS = [
  {
    id: 'mcp-server-id',
    tools: [
      {
        name: 'search_docs',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            cursor: { type: 'string' },
          },
        },
      },
    ],
  },
];

beforeEach(() => {
  mockUseFindManyMcpServers.mockReturnValue({
    loading: false,
    mcpServers: MCP_SERVERS,
  });
});
jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: () => null,
}));
jest.mock(
  '@/workflow/workflow-steps/components/WorkflowExpectedOutputBodyInput',
  () => ({ WorkflowExpectedOutputBodyInput: () => null }),
);
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields',
  () => ({
    WorkflowEditActionCodeFields: ({
      functionInput,
      onInputChange,
    }: {
      functionInput: FunctionInput;
      onInputChange: (value: string, path: string[]) => void;
    }) =>
      Object.keys(functionInput).map((fieldName) => (
        <input
          key={fieldName}
          aria-label={fieldName}
          value={functionInput[fieldName] ?? ''}
          onChange={(event) => onInputChange(event.target.value, [fieldName])}
        />
      )),
  }),
);

const buildStep = (toolName: string): WorkflowMcpToolAction => ({
  id: 'mcp-step-id',
  name: 'Search docs',
  type: 'MCP_TOOL',
  valid: true,
  settings: {
    input: { mcpServerId: 'mcp-server-id', toolName, toolInput: {} },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('WorkflowEditActionMcpTool', () => {
  it('saves every field edited before the debounced save fires', async () => {
    const onActionUpdate = jest.fn();

    render(
      <WorkflowEditActionMcpTool
        action={buildStep('search_docs')}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper },
    );

    await userEvent.type(screen.getByLabelText('query'), 'invoices');
    await userEvent.type(screen.getByLabelText('cursor'), 'page-2');

    await waitFor(() => expect(onActionUpdate).toHaveBeenCalledTimes(1));
    expect(onActionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          input: {
            mcpServerId: 'mcp-server-id',
            toolName: 'search_docs',
            toolInput: { query: 'invoices', cursor: 'page-2' },
          },
        }),
      }),
    );
  });

  it('tells the author when the server no longer offers the tool', () => {
    render(
      <WorkflowEditActionMcpTool
        action={buildStep('delete_docs')}
        actionOptions={{ readonly: true }}
      />,
      { wrapper },
    );

    expect(screen.getByText('Tool not found')).toBeVisible();
  });

  it('reports a failed server fetch instead of a missing tool', () => {
    mockUseFindManyMcpServers.mockReturnValue({
      loading: false,
      mcpServers: [],
      error: new Error('Forbidden'),
    });

    render(
      <WorkflowEditActionMcpTool
        action={buildStep('search_docs')}
        actionOptions={{ readonly: true }}
      />,
      { wrapper },
    );

    expect(screen.getByText('MCP servers unavailable')).toBeVisible();
    expect(screen.queryByText('Tool not found')).not.toBeInTheDocument();
  });
});
