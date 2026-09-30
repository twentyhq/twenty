import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/ends-on-pausing-tool-call.util';

const stepCalling = (...toolNames: string[]) => ({
  toolCalls: toolNames.map((toolName) => ({ toolName })),
});

describe('endsOnPausingToolCall', () => {
  it('pauses when the last step calls a declared pausing tool', () => {
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('search'), stepCalling('ask_questions')],
      }),
    ).toBe(true);
  });

  it('does not pause on a pausing tool called in an earlier step', () => {
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('ask_questions'), stepCalling('search')],
      }),
    ).toBe(false);
  });

  it('does not pause on a tool that is not declared as pausing', () => {
    expect(endsOnPausingToolCall({ steps: [stepCalling('search')] })).toBe(
      false,
    );
  });

  it('only pauses on a pausing tool the run was offered', () => {
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('ask_questions')],
        offeredToolNames: [],
      }),
    ).toBe(false);
    expect(
      endsOnPausingToolCall({
        steps: [stepCalling('ask_questions')],
        offeredToolNames: ['ask_questions'],
      }),
    ).toBe(true);
  });

  it('never pauses without steps', () => {
    expect(endsOnPausingToolCall({ steps: [] })).toBe(false);
  });
});
