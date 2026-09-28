import { render, screen } from '@testing-library/react';
import { type ToolUIPart } from 'ai';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';

jest.mock('@/ai/components/ToolStepRenderer', () => ({
  ToolStepRenderer: () => <div data-testid="tool-step-renderer" />,
}));

jest.mock('@/front-components/components/FrontComponentRenderer', () => ({
  FrontComponentRenderer: ({
    toolCall,
  }: {
    toolCall: { toolName: string; input?: Record<string, unknown> };
  }) => (
    <div data-testid="front-component">
      {`${toolCall.toolName}:${JSON.stringify(toolCall.input)}`}
    </div>
  ),
}));

jest.mock('@/front-components/components/FrontComponentSkeletonLoader', () => ({
  FrontComponentSkeletonLoader: () => <div data-testid="skeleton" />,
}));

const renderWidget = (toolPart: ToolUIPart) =>
  render(
    <AiChatToolWidget
      toolPart={toolPart}
      frontComponentId="20202020-0000-4000-8000-000000000001"
      isStreaming={false}
    />,
  );

describe('AiChatToolWidget', () => {
  it('hands the component the call it renders', async () => {
    renderWidget({
      type: 'tool-app_draft_reply',
      toolCallId: 'call_1',
      state: 'output-available',
      input: { subject: 'Hello' },
      output: {},
    } as unknown as ToolUIPart);

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'app_draft_reply:{"subject":"Hello"}',
    );
  });

  it('hands the component the dispatched tool when the call went through execute_tool', async () => {
    renderWidget({
      type: 'tool-execute_tool',
      toolCallId: 'call_1',
      state: 'output-available',
      input: {
        toolName: 'app_draft_reply',
        arguments: { subject: 'Hello' },
      },
      output: {},
    } as unknown as ToolUIPart);

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'app_draft_reply:{"subject":"Hello"}',
    );
  });
});
