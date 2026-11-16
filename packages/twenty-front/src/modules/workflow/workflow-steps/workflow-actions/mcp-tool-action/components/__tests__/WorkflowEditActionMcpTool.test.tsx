import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionMcpTool } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/components/WorkflowEditActionMcpTool';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { type FunctionInput } from 'twenty-shared/workflow';

type TestMcpToolStepResponse = {
  data: {
    testMcpToolStep: {
      success: boolean;
      result: Record<string, unknown> | null;
      error: string | null;
    };
  };
};

const mockUseFindManyMcpServers = jest.fn();
const mockTestMcpToolStep = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockTestMcpToolStep],
}));
jest.mock('@/workflow/hooks/useWorkflowVersionIdOrThrow', () => ({
  useWorkflowVersionIdOrThrow: () => 'workflow-version-id',
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));
jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: jest.fn() }),
}));
jest.mock('@/mcp-servers/hooks/useFindManyMcpServers', () => ({
  useFindManyMcpServers: () => mockUseFindManyMcpServers(),
}));

const MCP_SERVERS = [
  {
    id: 'mcp-server-id',
    label: 'Docs',
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
        annotations: { readOnlyHint: true },
      },
      {
        name: 'create_doc',
        inputSchema: {
          type: 'object',
          properties: { title: { type: 'string' } },
        },
        annotations: null,
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
  WorkflowStepFooter: ({
    additionalActions,
  }: {
    additionalActions?: ReactNode[];
  }) => additionalActions,
}));
jest.mock(
  '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton',
  () => ({
    WorkflowStepCmdEnterButton: ({
      title,
      onClick,
      disabled,
    }: {
      title: string;
      onClick: () => void;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {title}
      </button>
    ),
  }),
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

const buildStep = ({
  toolName,
  toolInput = {},
}: {
  toolName: string;
  toolInput?: WorkflowMcpToolAction['settings']['input']['toolInput'];
}): WorkflowMcpToolAction => ({
  id: `mcp-step-${toolName}`,
  name: 'Search docs',
  type: 'MCP_TOOL',
  valid: true,
  settings: {
    input: { mcpServerId: 'mcp-server-id', toolName, toolInput },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>
    <MemoryRouter>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </MemoryRouter>
  </Provider>
);

const openTestTab = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'Test' }));
};

const clickTestButton = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Test' }));
};

describe('WorkflowEditActionMcpTool', () => {
  beforeEach(() => {
    mockTestMcpToolStep.mockReset();
    resetJotaiStore();
  });

  it('saves every field edited before the debounced save fires', async () => {
    const onActionUpdate = jest.fn();

    render(
      <WorkflowEditActionMcpTool
        action={buildStep({ toolName: 'search_docs' })}
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
        action={buildStep({ toolName: 'delete_docs' })}
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
        action={buildStep({ toolName: 'search_docs' })}
        actionOptions={{ readonly: true }}
      />,
      { wrapper },
    );

    expect(screen.getByText('MCP servers unavailable')).toBeVisible();
    expect(screen.queryByText('Tool not found')).not.toBeInTheDocument();
  });

  it('runs a read-only tool without confirmation and saves its result as the expected output', async () => {
    const onActionUpdate = jest.fn();
    mockTestMcpToolStep.mockResolvedValue({
      data: {
        testMcpToolStep: {
          success: true,
          result: { total: 2, pages: [{ title: 'Invoices' }] },
          error: null,
        },
      },
    });

    render(
      <WorkflowEditActionMcpTool
        action={buildStep({
          toolName: 'search_docs',
          toolInput: { query: 'invoices', cursor: null },
        })}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper },
    );

    await openTestTab();
    await clickTestButton();

    expect(mockTestMcpToolStep).toHaveBeenCalledTimes(1);
    expect(mockTestMcpToolStep).toHaveBeenCalledWith({
      variables: {
        input: {
          workflowVersionId: 'workflow-version-id',
          mcpServerId: 'mcp-server-id',
          toolName: 'search_docs',
          toolArguments: { query: 'invoices', cursor: null },
          isDestructiveToolConfirmed: false,
        },
      },
    });
    expect(await screen.findByText('Output saved')).toBeVisible();
    expect(screen.getByText('total')).toBeVisible();
    expect(onActionUpdate).toHaveBeenCalledTimes(1);
    expect(onActionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          expectedOutputSchema: { total: 2, pages: [{ title: 'Invoices' }] },
        }),
      }),
    );
  });

  it('asks for confirmation before running a tool that is not marked read-only', async () => {
    const onActionUpdate = jest.fn();
    mockTestMcpToolStep.mockResolvedValue({
      data: {
        testMcpToolStep: {
          success: true,
          result: { id: 'doc-1' },
          error: null,
        },
      },
    });

    render(
      <WorkflowEditActionMcpTool
        action={buildStep({
          toolName: 'create_doc',
          toolInput: { title: 'Roadmap' },
        })}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper },
    );

    await openTestTab();
    await clickTestButton();

    expect(await screen.findByText('Run this tool for real?')).toBeVisible();
    expect(mockTestMcpToolStep).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Run tool' }));

    await waitFor(() => expect(mockTestMcpToolStep).toHaveBeenCalledTimes(1));
    expect(mockTestMcpToolStep).toHaveBeenCalledWith({
      variables: {
        input: {
          workflowVersionId: 'workflow-version-id',
          mcpServerId: 'mcp-server-id',
          toolName: 'create_doc',
          toolArguments: { title: 'Roadmap' },
          isDestructiveToolConfirmed: true,
        },
      },
    });
    await waitFor(() => expect(onActionUpdate).toHaveBeenCalledTimes(1));
    expect(onActionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          expectedOutputSchema: { id: 'doc-1' },
        }),
      }),
    );
  });

  it('keeps the arguments edited while the test was running', async () => {
    const onActionUpdate = jest.fn();
    let finishTest: (response: TestMcpToolStepResponse) => void = () => {};
    mockTestMcpToolStep.mockReturnValue(
      new Promise<TestMcpToolStepResponse>((resolve) => {
        finishTest = resolve;
      }),
    );

    render(
      <WorkflowEditActionMcpTool
        action={buildStep({
          toolName: 'search_docs',
          toolInput: { query: 'invoices', cursor: null },
        })}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper },
    );

    await openTestTab();
    await clickTestButton();
    await userEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    await userEvent.type(screen.getByLabelText('query'), '-2024');

    finishTest({
      data: {
        testMcpToolStep: { success: true, result: { total: 2 }, error: null },
      },
    });

    await waitFor(() =>
      expect(onActionUpdate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            input: expect.objectContaining({
              toolInput: { query: 'invoices-2024', cursor: null },
            }),
            expectedOutputSchema: { total: 2 },
          }),
        }),
      ),
    );
  });

  it('leaves the expected output alone when the tool returns nothing', async () => {
    const onActionUpdate = jest.fn();
    mockTestMcpToolStep.mockResolvedValue({
      data: { testMcpToolStep: { success: true, result: {}, error: null } },
    });

    render(
      <WorkflowEditActionMcpTool
        action={buildStep({ toolName: 'search_docs' })}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper },
    );

    await openTestTab();
    await clickTestButton();

    expect(await screen.findByText('No output returned')).toBeVisible();
    expect(screen.queryByText('Output saved')).not.toBeInTheDocument();
    expect(onActionUpdate).not.toHaveBeenCalled();
  });

  it('shows the tool error and keeps the expected output when the test fails', async () => {
    const onActionUpdate = jest.fn();
    mockTestMcpToolStep.mockResolvedValue({
      data: {
        testMcpToolStep: {
          success: false,
          result: null,
          error: 'Query is required',
        },
      },
    });

    render(
      <WorkflowEditActionMcpTool
        action={buildStep({ toolName: 'search_docs' })}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper },
    );

    await openTestTab();
    await clickTestButton();

    expect(await screen.findByText('Query is required')).toBeVisible();
    expect(onActionUpdate).not.toHaveBeenCalled();
  });
});
