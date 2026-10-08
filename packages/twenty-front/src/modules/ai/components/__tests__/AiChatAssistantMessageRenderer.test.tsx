import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'twenty-ui/theme';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { AiChatAssistantMessageRenderer } from '@/ai/components/AiChatAssistantMessageRenderer';

jest.mock('@/ai/components/ThinkingStepsDisplay', () => ({
  ThinkingStepsDisplay: ({
    hasAssistantTextResponseStarted,
    parts,
    isTrailingWhileStreaming,
    workDurationMs,
  }: {
    parts: unknown[];
    hasAssistantTextResponseStarted: boolean;
    isTrailingWhileStreaming?: boolean;
    workDurationMs?: number | null;
  }) => (
    <div data-testid="thinking-steps-display">
      {`thinking-${parts.length}-${hasAssistantTextResponseStarted ? 'answer-started' : 'answer-pending'}${isTrailingWhileStreaming ? '-trailing-while-streaming' : ''}${workDurationMs ? `-worked-${workDurationMs}` : ''}`}
    </div>
  ),
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownContent: ({ text }: { text: string }) => (
    <div data-testid="markdown-renderer">{text}</div>
  ),
}));

jest.mock('@/ai/components/CodeExecutionDisplay', () => ({
  CodeExecutionDisplay: () => <div data-testid="code-execution-display" />,
}));

jest.mock('@/ai/components/AiChatToolWidget', () => ({
  AiChatToolWidget: ({ toolPart }: { toolPart: { type: string } }) => (
    <div data-testid="tool-widget">{toolPart.type}</div>
  ),
}));

const APP_FRONT_COMPONENT_ID = '20202020-0000-4000-8000-000000000001';

const mockUseFrontComponentIdByToolName = jest.fn(
  () => new Map<string, string>(),
);

jest.mock('@/ai/hooks/useFrontComponentIdByToolName', () => ({
  useFrontComponentIdByToolName: () => mockUseFrontComponentIdByToolName(),
}));

const renderAssistantRenderer = (
  messageParts: ExtendedUIMessagePart[],
  {
    isLastMessageStreaming = false,
    shouldHideThinkingSteps = false,
    workDurationMs,
  }: {
    isLastMessageStreaming?: boolean;
    shouldHideThinkingSteps?: boolean;
    workDurationMs?: number | null;
  } = {},
) => {
  return render(
    <ThemeProvider colorScheme="light">
      <AiChatAssistantMessageRenderer
        messageParts={messageParts}
        isLastMessageStreaming={isLastMessageStreaming}
        shouldHideThinkingSteps={shouldHideThinkingSteps}
        workDurationMs={workDurationMs}
      />
    </ThemeProvider>,
  );
};

describe('AiChatAssistantMessageRenderer', () => {
  beforeEach(() => {
    mockUseFrontComponentIdByToolName.mockReturnValue(new Map());
  });

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

  it('should give the work duration to the last group of thinking steps only', () => {
    const messageParts = [
      {
        type: 'reasoning',
        text: 'First reasoning',
        state: 'done',
      },
      {
        type: 'text',
        text: 'Intermediate answer',
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

    renderAssistantRenderer(messageParts, { workDurationMs: 83_000 });

    const thinkingStepsDisplays = screen.getAllByTestId(
      'thinking-steps-display',
    );

    expect(thinkingStepsDisplays[0]).toHaveTextContent(
      /^thinking-1-answer-started$/,
    );
    expect(thinkingStepsDisplays[1]).toHaveTextContent(
      'thinking-1-answer-started-worked-83000',
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
    expect(screen.getByTestId('code-execution-display')).toBeInTheDocument();
  });

  it('should render tool-execute_tool wrapping code_interpreter via ThinkingStepsDisplay after refetch', () => {
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

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-1-answer-pending',
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

    expect(screen.queryByTestId('thinking-steps-display')).toBeNull();
    expect(screen.getByTestId('code-execution-display')).toBeInTheDocument();
  });

  it('should render non-thinking parts directly when there are no thinking steps', () => {
    const messageParts = [
      {
        type: 'text',
        text: 'Simple answer',
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
    expect(screen.getByTestId('code-execution-display')).toBeInTheDocument();
  });

  it('should hide the workspace setup completion tool part without splitting the thinking steps around it', () => {
    const messageParts = [
      {
        type: 'tool-web_search',
        toolCallId: 'tool-1',
        input: { query: 'crm software' },
        output: { result: { ok: true } },
        state: 'output-available',
      },
      {
        type: 'tool-complete_workspace_setup',
        toolCallId: 'tool-2',
        input: {},
        output: { success: true, message: 'Setup marked as finished.' },
        state: 'output-available',
      },
      {
        type: 'tool-web_search',
        toolCallId: 'tool-3',
        input: { query: 'crm pricing' },
        output: { result: { ok: true } },
        state: 'output-available',
      },
      {
        type: 'text',
        text: 'Here is what we built together.',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-2-answer-started',
    );
  });

  it('should render nothing when the workspace setup completion is the only content', () => {
    const messageParts = [
      { type: 'step-start' },
      {
        type: 'tool-complete_workspace_setup',
        toolCallId: 'tool-1',
        input: {},
        output: { success: true, message: 'Setup marked as finished.' },
        state: 'output-available',
      },
    ] as ExtendedUIMessagePart[];

    const { container } = renderAssistantRenderer(messageParts);

    expect(container).toBeEmptyDOMElement();
  });

  it('should still show the loading indicator for a message whose content has not arrived yet', () => {
    const messageParts = [{ type: 'step-start' }] as ExtendedUIMessagePart[];

    const { container } = renderAssistantRenderer(messageParts);

    expect(container).not.toBeEmptyDOMElement();
  });

  it('should keep the loading indicator while the workspace setup completion is still running', () => {
    const messageParts = [
      { type: 'step-start' },
      {
        type: 'tool-complete_workspace_setup',
        toolCallId: 'tool-1',
        input: {},
        state: 'input-streaming',
      },
    ] as ExtendedUIMessagePart[];

    const { container } = renderAssistantRenderer(messageParts);

    expect(container).not.toBeEmptyDOMElement();
  });

  it('should show a failed workspace setup completion instead of hiding it', () => {
    const messageParts = [
      { type: 'step-start' },
      {
        type: 'tool-complete_workspace_setup',
        toolCallId: 'tool-1',
        input: {},
        state: 'output-error',
        errorText: 'Tool execution failed',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-1',
    );
  });

  it('should flag the trailing thinking steps group while streaming', () => {
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
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts, { isLastMessageStreaming: true });

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'trailing-while-streaming',
    );
  });

  it('should not flag a thinking steps group when answer text follows it', () => {
    const messageParts = [
      {
        type: 'tool-web_search',
        toolCallId: 'tool-1',
        input: { query: 'crm software' },
        output: { result: { ok: true } },
        state: 'output-available',
      },
      {
        type: 'text',
        text: 'Partial answer',
        state: 'streaming',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts, { isLastMessageStreaming: true });

    expect(screen.getByTestId('thinking-steps-display')).not.toHaveTextContent(
      'trailing-while-streaming',
    );
  });

  it('should not flag the trailing thinking steps group when the message is not streaming', () => {
    const messageParts = [
      {
        type: 'tool-web_search',
        toolCallId: 'tool-1',
        input: { query: 'crm software' },
        output: { result: { ok: true } },
        state: 'output-available',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.getByTestId('thinking-steps-display')).not.toHaveTextContent(
      'trailing-while-streaming',
    );
  });

  it('should group a dynamic-tool part (native web search) into ThinkingStepsDisplay', () => {
    const messageParts = [
      {
        type: 'dynamic-tool',
        toolName: 'web_search',
        toolCallId: 'dyn-1',
        input: { query: 'crm software' },
        output: { result: { ok: true } },
        state: 'output-available',
        providerExecuted: true,
      },
      {
        type: 'text',
        text: 'Final answer',
      },
    ] as ExtendedUIMessagePart[];

    renderAssistantRenderer(messageParts);

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-1-answer-started',
    );
  });

  it('should render a call that has an app widget on its own, not folded into the step group', () => {
    mockUseFrontComponentIdByToolName.mockReturnValue(
      new Map([['app_show_chart', APP_FRONT_COMPONENT_ID]]),
    );

    renderAssistantRenderer([
      {
        type: 'tool-app_show_chart',
        toolCallId: 'call_1',
        state: 'output-available',
        input: {},
        output: {},
      },
    ] as unknown as ExtendedUIMessagePart[]);

    expect(screen.getByTestId('tool-widget')).toHaveTextContent(
      'tool-app_show_chart',
    );
    expect(screen.queryByTestId('thinking-steps-display')).toBeNull();
  });

  it('should resolve the widget of a call dispatched through execute_tool', () => {
    mockUseFrontComponentIdByToolName.mockReturnValue(
      new Map([['app_show_chart', APP_FRONT_COMPONENT_ID]]),
    );

    renderAssistantRenderer([
      {
        type: 'tool-execute_tool',
        toolCallId: 'call_1',
        state: 'output-available',
        input: { toolName: 'app_show_chart', arguments: {} },
        output: {},
      },
    ] as unknown as ExtendedUIMessagePart[]);

    expect(screen.getByTestId('tool-widget')).toBeInTheDocument();
  });

  it('should keep a call that has an app widget but is still streaming its input in the step group', () => {
    mockUseFrontComponentIdByToolName.mockReturnValue(
      new Map([['app_show_chart', APP_FRONT_COMPONENT_ID]]),
    );

    renderAssistantRenderer([
      {
        type: 'tool-app_show_chart',
        toolCallId: 'call_1',
        state: 'input-streaming',
        input: {},
      },
    ] as unknown as ExtendedUIMessagePart[]);

    expect(screen.getByTestId('thinking-steps-display')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-widget')).toBeNull();
  });

  it('should drop finished reasoning that has no text', () => {
    renderAssistantRenderer([
      {
        type: 'reasoning',
        text: '',
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
        type: 'reasoning',
        text: '  ',
        state: 'done',
      },
      {
        type: 'text',
        text: 'Final answer',
      },
    ] as ExtendedUIMessagePart[]);

    expect(screen.getByTestId('thinking-steps-display')).toHaveTextContent(
      'thinking-1-answer-started',
    );
  });

  it('should drop a step group made only of hidden reasoning', () => {
    renderAssistantRenderer([
      {
        type: 'reasoning',
        text: '',
        state: 'done',
      },
      {
        type: 'text',
        text: 'Final answer',
      },
    ] as ExtendedUIMessagePart[]);

    expect(screen.queryByTestId('thinking-steps-display')).toBeNull();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Final answer',
    );
  });

  it('should render nothing for a finished message whose only reasoning was hidden', () => {
    const { container } = renderAssistantRenderer([
      { type: 'step-start' },
      {
        type: 'reasoning',
        text: '',
        state: 'done',
      },
    ] as ExtendedUIMessagePart[]);

    expect(container).toBeEmptyDOMElement();
  });

  it('should keep the loading indicator while a message with only hidden reasoning is still streaming', () => {
    const { container } = renderAssistantRenderer(
      [
        {
          type: 'reasoning',
          text: '',
          state: 'done',
        },
      ] as ExtendedUIMessagePart[],
      { isLastMessageStreaming: true },
    );

    expect(container).not.toBeEmptyDOMElement();
  });

  it('should hide thinking steps but keep the answer when asked to', () => {
    renderAssistantRenderer(
      [
        {
          type: 'reasoning',
          text: 'Reasoning content',
          state: 'done',
        },
        {
          type: 'text',
          text: 'Welcome',
        },
      ] as ExtendedUIMessagePart[],
      { shouldHideThinkingSteps: true },
    );

    expect(
      screen.queryByTestId('thinking-steps-display'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Welcome',
    );
  });

  it('should show the loading indicator instead of hidden thinking steps while streaming', () => {
    const { container } = renderAssistantRenderer(
      [
        {
          type: 'reasoning',
          text: 'Reasoning content',
          state: 'streaming',
        },
      ] as ExtendedUIMessagePart[],
      { isLastMessageStreaming: true, shouldHideThinkingSteps: true },
    );

    expect(
      screen.queryByTestId('thinking-steps-display'),
    ).not.toBeInTheDocument();
    expect(container).not.toBeEmptyDOMElement();
  });

  it('should still show thinking steps on a finished message that has nothing else to render', () => {
    renderAssistantRenderer(
      [
        {
          type: 'reasoning',
          text: 'Reasoning content',
          state: 'done',
        },
      ] as ExtendedUIMessagePart[],
      { shouldHideThinkingSteps: true },
    );

    expect(screen.getByTestId('thinking-steps-display')).toBeInTheDocument();
  });
});
