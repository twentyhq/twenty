import { render, screen } from '@testing-library/react';
import { type ToolUIPart } from 'ai';
import {
  PREVIEW_FRONT_COMPONENT_TOOL_NAME,
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
} from 'twenty-shared/ai';

import { AiChatFrontComponentToolPreview } from '@/ai/components/AiChatFrontComponentToolPreview';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';

let pendingToolCalls: AgentChatPendingToolCall[] = [];

jest.mock('@/ai/hooks/useAgentChatPendingToolCalls', () => ({
  useAgentChatPendingToolCalls: () => pendingToolCalls,
}));

jest.mock('@/ai/components/AiChatFrontComponentPreview', () => ({
  AiChatFrontComponentPreview: () => (
    <div role="region" aria-label="Component preview" />
  ),
}));

jest.mock('@/ai/components/ThinkingToolStepRow', () => ({
  ThinkingToolStepRow: () => <span>Preview tool result</span>,
}));

const TOOL_PART: ToolUIPart = {
  type: `tool-${PREVIEW_FRONT_COMPONENT_TOOL_NAME}`,
  toolCallId: 'preview-call',
  state: 'output-available',
  input: {},
  output: { success: true, result: { draftId: 'draft' } },
};

const approval = (
  draftId: string,
  toolName = PUBLISH_FRONT_COMPONENT_TOOL_NAME,
): AgentChatPendingToolCall => ({
  kind: 'toolCallApproval',
  toolCallId: 'approval-call',
  proposal: {
    toolName,
    toolLabel: 'Publish Front Component',
    summary: 'Save this component',
    template: 'frontComponent',
    arguments: { draftId, checksum: 'a'.repeat(64) },
  },
});

describe('AiChatFrontComponentToolPreview', () => {
  beforeEach(() => {
    pendingToolCalls = [];
  });

  it('shows the preview before approval and again after the request is answered', () => {
    const component = (
      <AiChatFrontComponentToolPreview
        toolPart={TOOL_PART}
        isStreaming={false}
      />
    );
    const { rerender } = render(component);
    expect(
      screen.getByRole('region', { name: 'Component preview' }),
    ).toBeInTheDocument();

    pendingToolCalls = [approval('draft')];
    rerender(
      <AiChatFrontComponentToolPreview
        toolPart={TOOL_PART}
        isStreaming={false}
      />,
    );
    expect(
      screen.queryByRole('region', { name: 'Component preview' }),
    ).not.toBeInTheDocument();

    pendingToolCalls = [];
    rerender(component);
    expect(
      screen.getByRole('region', { name: 'Component preview' }),
    ).toBeInTheDocument();
  });

  it.each([approval('other-draft'), approval('draft', 'another_tool')])(
    'keeps the preview for an unrelated approval',
    (pendingApproval) => {
      pendingToolCalls = [pendingApproval];
      render(
        <AiChatFrontComponentToolPreview
          toolPart={TOOL_PART}
          isStreaming={false}
        />,
      );
      expect(
        screen.getByRole('region', { name: 'Component preview' }),
      ).toBeInTheDocument();
    },
  );

  it('keeps failed preview tool results visible during approval', () => {
    pendingToolCalls = [approval('draft')];
    render(
      <AiChatFrontComponentToolPreview
        toolPart={{
          ...TOOL_PART,
          output: { success: false, error: 'Build failed' },
        }}
        isStreaming={false}
      />,
    );
    expect(screen.getByText('Preview tool result')).toBeInTheDocument();
  });
});
