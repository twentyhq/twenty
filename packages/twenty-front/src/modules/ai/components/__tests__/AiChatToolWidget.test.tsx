import { render, screen } from '@testing-library/react';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';

jest.mock('@/front-components/components/FrontComponentRenderer', () => ({
  FrontComponentRenderer: ({
    toolCall,
  }: {
    toolCall: {
      toolName: string;
      status: string;
      input?: Record<string, unknown>;
    };
  }) => (
    <div data-testid="front-component">
      {`${toolCall.toolName}:${toolCall.status}:${JSON.stringify(toolCall.input)}`}
    </div>
  ),
}));

jest.mock('@/front-components/components/FrontComponentSkeletonLoader', () => ({
  FrontComponentSkeletonLoader: () => <div data-testid="skeleton" />,
}));

describe('AiChatToolWidget', () => {
  it('hands the component the call it renders', async () => {
    render(
      <AiChatToolWidget
        toolCall={{
          toolCallId: 'call_1',
          toolName: 'app_draft_reply',
          status: 'approval-requested',
          input: { subject: 'Hello' },
        }}
        frontComponentId="20202020-0000-4000-8000-000000000001"
        unavailableFallback={null}
      />,
    );

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'app_draft_reply:approval-requested:{"subject":"Hello"}',
    );
  });
});
