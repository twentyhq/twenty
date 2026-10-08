import { type ToolUIPart } from 'ai';

import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';

const buildToolPart = (
  type: string,
  input: Record<string, unknown>,
): ToolUIPart =>
  ({
    type,
    toolCallId: 'call_1',
    state: 'output-available',
    input,
    output: {},
  }) as unknown as ToolUIPart;

describe('getEffectiveToolName', () => {
  it('returns the tool name of a direct call', () => {
    expect(
      getEffectiveToolName(buildToolPart('tool-find_many_companies', {})),
    ).toBe('find_many_companies');
  });

  it('returns the dispatched tool name of an execute_tool call', () => {
    expect(
      getEffectiveToolName(
        buildToolPart('tool-execute_tool', {
          toolName: 'create_one_task',
          arguments: { title: 'Follow up' },
        }),
      ),
    ).toBe('create_one_task');
  });

  it('falls back to execute_tool when the dispatch payload is unreadable', () => {
    expect(
      getEffectiveToolName(buildToolPart('tool-execute_tool', { oops: true })),
    ).toBe('execute_tool');
  });
});
