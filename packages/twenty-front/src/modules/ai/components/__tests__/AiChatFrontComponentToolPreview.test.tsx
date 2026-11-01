import { render, screen } from '@testing-library/react';
import { type ToolUIPart } from 'ai';

import { AiChatFrontComponentToolPreview } from '@/ai/components/AiChatFrontComponentToolPreview';

jest.mock('@/ai/components/AiChatFrontComponentPreview', () => ({
  AiChatFrontComponentPreview: ({ draftId }: { draftId: string }) => (
    <div>Preview {draftId}</div>
  ),
}));
jest.mock('@/ai/components/ThinkingToolStepRow', () => ({
  ThinkingToolStepRow: () => <div>Tool details</div>,
}));

const renderResult = (output: unknown) => {
  const toolPart: ToolUIPart = {
    type: 'tool-preview_front_component',
    toolCallId: 'preview-call',
    state: 'output-available',
    input: {},
    output,
  };
  return render(
    <AiChatFrontComponentToolPreview toolPart={toolPart} isStreaming={false} />,
  );
};

describe('AiChatFrontComponentToolPreview', () => {
  it('shows the draft returned by a successful tool call', () => {
    renderResult({ success: true, result: { draftId: 'draft-id' } });
    expect(screen.getByText('Preview draft-id')).toBeInTheDocument();
    expect(screen.queryByText('Tool details')).not.toBeInTheDocument();
  });

  it.each([
    undefined,
    { success: false, result: { draftId: 'draft-id' } },
    { success: true, result: { draftId: 42 } },
    { success: true, result: { draftId: '' } },
  ])('keeps unsuccessful or malformed output in tool details: %s', (output) => {
    renderResult(output);
    expect(screen.getByText('Tool details')).toBeInTheDocument();
    expect(screen.queryByText(/Preview/)).not.toBeInTheDocument();
  });
});
