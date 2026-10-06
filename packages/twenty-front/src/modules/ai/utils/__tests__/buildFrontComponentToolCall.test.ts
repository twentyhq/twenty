import { type ToolUIPart } from 'ai';

import { buildFrontComponentToolCall } from '@/ai/utils/buildFrontComponentToolCall';

describe('buildFrontComponentToolCall', () => {
  it('hands the component the call it renders', () => {
    expect(
      buildFrontComponentToolCall({
        type: 'tool-app_draft_reply',
        toolCallId: 'call_1',
        state: 'output-available',
        input: { subject: 'Hello' },
        output: { success: true },
      } as unknown as ToolUIPart),
    ).toEqual({
      toolCallId: 'call_1',
      toolName: 'app_draft_reply',
      status: 'output-available',
      input: { subject: 'Hello' },
      output: { success: true },
      errorText: undefined,
    });
  });

  it('hands the component the dispatched tool when the call went through execute_tool', () => {
    expect(
      buildFrontComponentToolCall({
        type: 'tool-execute_tool',
        toolCallId: 'call_1',
        state: 'output-error',
        input: {
          toolName: 'app_draft_reply',
          arguments: { subject: 'Hello' },
        },
        errorText: 'Failed',
      } as unknown as ToolUIPart),
    ).toEqual({
      toolCallId: 'call_1',
      toolName: 'app_draft_reply',
      status: 'output-error',
      input: { subject: 'Hello' },
      output: undefined,
      errorText: 'Failed',
    });
  });
});
