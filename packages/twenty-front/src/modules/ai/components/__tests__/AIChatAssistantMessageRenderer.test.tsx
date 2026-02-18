import { render, screen } from '@testing-library/react';
import {
  THEME_LIGHT,
  ThemeContextProvider,
  ThemeProvider,
} from 'twenty-ui/theme';
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
    <ThemeProvider theme={THEME_LIGHT}>
      <ThemeContextProvider theme={THEME_LIGHT}>
        <AIChatAssistantMessageRenderer
          messageParts={messageParts}
          isLastMessageStreaming={false}
        />
      </ThemeContextProvider>
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

  it('should keep code interpreter rendering path unchanged and out of thinking grouping', () => {
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
    expect(screen.getByTestId('tool-step-renderer')).toHaveTextContent(
      'tool-code_interpreter',
    );
    expect(screen.queryByTestId('code-execution-display')).toBeNull();
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
