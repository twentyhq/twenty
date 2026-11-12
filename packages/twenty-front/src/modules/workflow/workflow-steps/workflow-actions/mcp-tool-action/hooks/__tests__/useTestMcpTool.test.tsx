import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useTestMcpTool } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/hooks/useTestMcpTool';
import { mcpToolTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/states/mcpToolTestDataFamilyState';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';

const mockTestMcpToolStep = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockTestMcpToolStep],
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));

const buildToolCall = () => ({
  mcpServerId: 'mcp-server-id',
  toolName: 'search_docs',
  toolInput: {
    query: '{{trigger.properties.after.name}}',
    limit: 5,
    tags: ['{{trigger.properties.after.name}}'],
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>{children}</Provider>
);

describe('useTestMcpTool', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockTestMcpToolStep.mockReset();
  });

  it('replaces workflow variables with their test values before calling the tool', async () => {
    const actionId = 'action-with-variables';

    jotaiStore.set(mcpToolTestDataFamilyState.atomFamily(actionId), {
      variableValues: { 'trigger.properties.after.name': 'Acme' },
      output: { status: 'idle' },
    });
    mockTestMcpToolStep.mockResolvedValue({
      data: { testMcpToolStep: { success: true, result: { total: 1 } } },
    });
    const toolCall = buildToolCall();

    const { result } = renderHook(() => useTestMcpTool(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testMcpTool(toolCall);
    });

    expect(mockTestMcpToolStep).toHaveBeenCalledTimes(1);
    expect(mockTestMcpToolStep).toHaveBeenCalledWith({
      variables: {
        input: {
          mcpServerId: 'mcp-server-id',
          toolName: 'search_docs',
          toolArguments: { query: 'Acme', limit: 5, tags: ['Acme'] },
        },
      },
    });
    expect(toolCall.toolInput).toEqual(buildToolCall().toolInput);
    expect(result.current.mcpToolTestData.output).toEqual({
      status: 'success',
      result: { total: 1 },
    });
  });

  it('reports a request failure as a test error', async () => {
    mockTestMcpToolStep.mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useTestMcpTool('failing-action'), {
      wrapper,
    });

    await act(async () => {
      await result.current.testMcpTool(buildToolCall());
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.mcpToolTestData.output).toEqual({
      status: 'error',
      error: 'Network down',
    });
  });
});
