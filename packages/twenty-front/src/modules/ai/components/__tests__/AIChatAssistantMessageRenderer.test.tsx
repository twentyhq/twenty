import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { AIChatAssistantMessageRenderer } from '@/ai/components/AIChatAssistantMessageRenderer';

jest.mock('@/ai/components/ThinkingStepsDisplay', () => ({
  ThinkingStepsDisplay: ({
    hasAssistantTextResponseStarted,
    parts,
  }: {
    parts: unknown[];
    hasAssistantTextResponseStarted: boolean;
  }) => (
    <div data-testid="thinking-steps-display">
      {`thinking-${parts.length}-${hasAssistantTextResponseStarted ? 'answer-started' : 'answer-pending'}`}
    </div>
  ),
}));

jest.mock('@/ai/components/ToolStepRenderer', () => ({
  ToolStepRenderer: ({ toolPart }: { toolPart: { type: string } }) => (
    <div data-testid="tool-step-renderer">{toolPart.type}</div>
  ),
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownRenderer: ({ text }: { text: string }) => (
    <div data-testid="markdown-renderer">{text}</div>
  ),
}));

jest.mock('@/ai/components/RoutingStatusDisplay', () => ({
  RoutingStatusDisplay: ({ data }: { data: { text: string } }) => (
    <div data-testid="routing-status-display">{data.text}</div>
  ),
}));

jest.mock('@/ai/components/CodeExecutionDisplay', () => ({
  CodeExecutionDisplay: () => <div data-testid="code-execution-display" />,
}));

const renderAssistantRenderer = (messageParts: ExtendedUIMessagePart[]) => {
  return render(
    <ThemeProvider colorScheme="light">
      <AIChatAssistantMessageRenderer
        messageParts={messageParts}
        isLastMessageStreaming={false}
      />
    </ThemeProvider>,
  );
};

describe('AIChatAssistantMessageRenderer', () => {
  it('should group reasoning and tool steps into ThinkingStepsDisplay', () => {
    const messageParts = [
      {
        type: 'reasoning',
        text: 'Reasoning content',
        state: 'done',
      },
      {
        type: 'tool-web_search',
        toolCallId: 'tool-1',
        input: { query: 'crm software' },
        output: { result: { ok: true } },
        state: 'output-available',
      },
      {
        type: 'text',
        text: 'Final answer',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-2-answer-started',
    );
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Final answer',
    );
  });

  it('should keep answer-started false for thinking blocks with no following text', () => {
    const messageParts = [
      {
        type: 'text',
        text: 'Preamble',
      },
      {
        type: 'reasoning',
        text: 'Reasoning content',
        state: 'done',
      },
      {
        type: 'tool-web_search',
        toolCallId: 'tool-1',
        input: { query: 'crm software' },
        output: { result: { ok: true } },
        state: 'output-available',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-2-answer-pending',
    );
  });

  it('should show data-code-execution during streaming and hide the tool part to avoid duplicates', () => {
    const messageParts = [
      {
        type: 'tool-code_interpreter',
        toolCallId: 'tool-code-1',
        input: { code: 'print(1)' },
        output: { result: { stdout: '1' } },
        state: 'output-available',
      },
      {
        type: 'data-code-execution',
        data: {
          executionId: 'exec-1',
          state: 'running',
          code: 'print(1)',
          language: 'python',
          stdout: '',
          stderr: '',
          files: [],
        },
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.queryByTestId('thinking-steps-display')).toBeNull();
    expect(screen.queryByTestId('tool-step-renderer')).toBeNull();
    expect(screen.getByTestId('code-execution-display')).toBeInTheDocument();
  });

  it('should render tool-execute_tool wrapping code_interpreter via ToolStepRenderer after refetch', () => {
    const messageParts = [
      {
        type: 'tool-execute_tool',
        toolCallId: 'tool-exec-1',
        input: {
          toolName: 'code_interpreter',
          arguments: { code: 'print(42)' },
        },
        output: {
          result: { stdout: '42', stderr: '', exitCode: 0, files: [] },
        },
        state: 'output-available',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.queryByTestId('thinking-steps-display')).toBeNull();
    expect(screen.getByTestId('tool-step-renderer')).toHaveTextContent(
      'tool-execute_tool',
    );
  });

  it('should hide execute_tool wrapping code_interpreter when data-code-execution parts exist', () => {
    const messageParts = [
      {
        type: 'tool-execute_tool',
        toolCallId: 'tool-exec-1',
        input: {
          toolName: 'code_interpreter',
          arguments: { code: 'print(42)' },
        },
        output: null,
        state: 'call',
      },
      {
        type: 'data-code-execution',
        data: {
          executionId: 'exec-2',
          state: 'running',
          code: 'print(42)',
          language: 'python',
          stdout: '42',
          stderr: '',
          files: [],
        },
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.queryByTestId('tool-step-renderer')).toBeNull();
    expect(screen.getByTestId('code-execution-display')).toBeInTheDocument();
  });

  it('should render non-thinking parts directly when there are no thinking steps', () => {
    const messageParts = [
      {
        type: 'text',
        text: 'Simple answer',
      },
      {
        type: 'data-routing-status',
        data: {
          text: 'Routing complete',
          state: 'routed',
        },
      },
      {
        type: 'data-code-execution',
        data: {
          executionId: 'exec-2',
          state: 'completed',
          code: 'print(2)',
          language: 'python',
          stdout: '2',
          stderr: '',
          files: [],
        },
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.queryByTestId('thinking-steps-display')).toBeNull();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Simple answer',
    );
    expect(screen.getByTestId('routing-status-display')).toHaveTextContent(
      'Routing complete',
    );
    expect(screen.getByTestId('code-execution-display')).toBeInTheDocument();
  });
});
