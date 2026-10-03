import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/ends-on-pausing-tool-call.util';

const PENDING_OUTPUT = { success: true, result: { status: 'pending' } };

const stepWithResults = (
  ...toolResults: { toolName: string; output: unknown }[]
) => ({ toolResults });

const awaiting = (toolName: string) => ({ toolName, output: PENDING_OUTPUT });

describe('endsOnPausingToolCall', () => {
  it('pauses when the last step has a pausing call awaiting an answer', () => {
    expect(
      endsOnPausingToolCall({
        steps: [
          stepWithResults({ toolName: 'search', output: {} }),
          stepWithResults(awaiting('ask_question')),
        ],
      }),
    ).toBe(true);
  });

  it('does not pause on a pausing call made in an earlier step', () => {
    expect(
      endsOnPausingToolCall({
        steps: [
          stepWithResults(awaiting('ask_question')),
          stepWithResults({ toolName: 'search', output: {} }),
        ],
      }),
    ).toBe(false);
  });

  it('does not pause on a tool that is not declared as pausing', () => {
    expect(
      endsOnPausingToolCall({ steps: [stepWithResults(awaiting('search'))] }),
    ).toBe(false);
  });

  it('only pauses on a pausing tool the run was offered', () => {
    const steps = [stepWithResults(awaiting('ask_question'))];

    expect(endsOnPausingToolCall({ steps, offeredToolNames: [] })).toBe(false);
    expect(
      endsOnPausingToolCall({ steps, offeredToolNames: ['ask_question'] }),
    ).toBe(true);
  });

  it('does not pause on a pausing call refused when it was made', () => {
    expect(
      endsOnPausingToolCall({
        steps: [
          stepWithResults({
            toolName: 'propose_tool_call',
            output: { success: false, error: 'Tool is not available' },
          }),
        ],
      }),
    ).toBe(false);
  });

  it('does not pause on a pausing call that failed with no result', () => {
    expect(endsOnPausingToolCall({ steps: [stepWithResults()] })).toBe(false);
  });

  it('never pauses without steps', () => {
    expect(endsOnPausingToolCall({ steps: [] })).toBe(false);
  });
});
