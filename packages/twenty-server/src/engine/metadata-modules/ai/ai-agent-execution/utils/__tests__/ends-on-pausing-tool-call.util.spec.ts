import { type StepResult, type ToolSet } from 'ai';

import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/ends-on-pausing-tool-call.util';

const stepCalling = (...toolNames: string[]) =>
  ({
    toolCalls: toolNames.map((toolName) => ({ toolName })),
  }) as Pick<StepResult<ToolSet>, 'toolCalls'>;

describe('endsOnPausingToolCall', () => {
  it('pauses when the last step calls a pausing tool', () => {
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('search'), stepCalling('ask_questions')],
        pausingToolNames: ['ask_questions'],
      }),
    ).toBe(true);
  });

  it('does not pause on a pausing tool called in an earlier step', () => {
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('ask_questions'), stepCalling('search')],
        pausingToolNames: ['ask_questions'],
      }),
    ).toBe(false);
  });

  it('never pauses without pausing tools or steps', () => {
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('ask_questions')],
        pausingToolNames: [],
      }),
    ).toBe(false);
    expect(
      endsOnPausingToolCall({ steps: [], pausingToolNames: ['ask_questions'] }),
    ).toBe(false);
  });
});
