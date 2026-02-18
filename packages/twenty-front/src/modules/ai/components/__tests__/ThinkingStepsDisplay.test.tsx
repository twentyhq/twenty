import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  THEME_LIGHT,
  ThemeContextProvider,
  ThemeProvider,
} from 'twenty-ui/theme';

import { ThinkingStepsDisplay } from '@/ai/components/ThinkingStepsDisplay';
import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copyToClipboard: jest.fn(),
  }),
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue',
  () => ({
    useRecoilComponentValue: () => 'output',
  }),
);

jest.mock('@/ui/layout/tab-list/components/TabList', () => ({
  TabList: ({
    tabs,
    onTabChange,
  }: {
    tabs: Array<{ id: string; title: string }>;
    onTabChange?: (tabId: string) => void;
  }) => (
    <div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange?.(tab.id)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  ),
}));

const createReasoningPart = ({
  state = 'done',
  text = 'Reasoning content',
}: {
  state?: string;
  text?: string;
} = {}): ThinkingStepPart =>
  ({
    type: 'reasoning',
    text,
    state,
  }) as ThinkingStepPart;

const createToolPart = ({
  input = { query: 'crm software' },
  output = { result: { ok: true } },
  type = 'tool-web_search',
}: {
  type?: `tool-${string}`;
  input?: Record<string, unknown>;
  output?: unknown;
} = {}): ThinkingStepPart =>
  ({
    type,
    toolCallId: `${type}-call-id`,
    input,
    output,
    state: 'output-available',
  }) as ThinkingStepPart;

const renderThinkingStepsDisplay = ({
  hasAssistantTextResponseStarted = false,
  isLastMessageStreaming,
  parts,
}: {
  parts: ThinkingStepPart[];
  isLastMessageStreaming: boolean;
  hasAssistantTextResponseStarted?: boolean;
}) => {
  return render(
    <ThemeProvider theme={THEME_LIGHT}>
      <ThemeContextProvider theme={THEME_LIGHT}>
        <ThinkingStepsDisplay
          parts={parts}
          isLastMessageStreaming={isLastMessageStreaming}
          hasAssistantTextResponseStarted={hasAssistantTextResponseStarted}
        />
      </ThemeContextProvider>
    </ThemeProvider>,
  );
};

describe('ThinkingStepsDisplay', () => {
  it('should render expanded thinking rows with active loader while streaming', () => {
    renderThinkingStepsDisplay({
      isLastMessageStreaming: true,
      parts: [
        createToolPart(),
        createReasoningPart({
          state: 'streaming',
          text: 'Active reasoning content',
        }),
      ],
    });

    expect(screen.queryByRole('button', { name: /steps/i })).toBeNull();
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    expect(screen.getByText('Active reasoning content')).toBeInTheDocument();
    expect(
      screen.getByText('Searched the web for crm software'),
    ).toBeInTheDocument();
    expect(document.querySelector('svg[viewBox="0 0 14 14"]')).not.toBeNull();
  });

  it('should render done state collapsed by default', () => {
    renderThinkingStepsDisplay({
      isLastMessageStreaming: false,
      hasAssistantTextResponseStarted: true,
      parts: [
        createToolPart(),
        createReasoningPart({
          state: 'done',
          text: 'Completed reasoning content',
        }),
      ],
    });

    const summaryButton = screen.getByRole('button', { name: /2 steps/i });

    expect(summaryButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Thought')).toBeNull();
    expect(screen.queryByText('Completed reasoning content')).toBeNull();
  });

  it('should keep done state expanded while streaming before answer text starts', () => {
    renderThinkingStepsDisplay({
      isLastMessageStreaming: true,
      hasAssistantTextResponseStarted: false,
      parts: [
        createToolPart(),
        createReasoningPart({
          state: 'done',
          text: 'Completed reasoning content',
        }),
      ],
    });

    expect(screen.queryByRole('button', { name: /steps/i })).toBeNull();
    expect(screen.getByText('Thought')).toBeInTheDocument();
    expect(screen.getByText('Completed reasoning content')).toBeInTheDocument();
  });

  it('should collapse done state once answer text starts while streaming', () => {
    renderThinkingStepsDisplay({
      isLastMessageStreaming: true,
      hasAssistantTextResponseStarted: true,
      parts: [
        createToolPart(),
        createReasoningPart({
          state: 'done',
          text: 'Completed reasoning content',
        }),
      ],
    });

    const summaryButton = screen.getByRole('button', { name: /2 steps/i });

    expect(summaryButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Thought')).toBeNull();
    expect(screen.queryByText('Completed reasoning content')).toBeNull();
  });

  it('should render rows and full reasoning content after expanding done state', async () => {
    renderThinkingStepsDisplay({
      isLastMessageStreaming: false,
      hasAssistantTextResponseStarted: true,
      parts: [
        createToolPart(),
        createReasoningPart({
          state: 'done',
          text: 'Completed reasoning content',
        }),
      ],
    });

    const summaryButton = screen.getByRole('button', { name: /2 steps/i });

    await userEvent.click(summaryButton);

    expect(summaryButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Thought')).toBeInTheDocument();
    expect(screen.getByText('Completed reasoning content')).toBeInTheDocument();
    expect(
      screen.getByText('Searched the web for crm software'),
    ).toBeInTheDocument();
  });

  it('should toggle tool details and display output/input tabs', async () => {
    renderThinkingStepsDisplay({
      isLastMessageStreaming: false,
      hasAssistantTextResponseStarted: true,
      parts: [
        createToolPart(),
        createReasoningPart({
          state: 'done',
          text: 'Completed reasoning content',
        }),
      ],
    });

    const summaryButton = screen.getByRole('button', { name: /2 steps/i });
    await userEvent.click(summaryButton);

    const toolButton = screen.getByRole('button', {
      name: /searched the web for crm software/i,
    });

    expect(toolButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Output' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Input' })).toBeNull();

    await userEvent.click(toolButton);

    expect(toolButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Output' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Input' })).toBeInTheDocument();

    await userEvent.click(toolButton);

    expect(toolButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Output' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Input' })).toBeNull();
    });
  });
});
