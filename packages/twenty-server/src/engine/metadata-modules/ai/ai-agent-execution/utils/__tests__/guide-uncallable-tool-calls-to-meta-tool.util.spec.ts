import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { guideUncallableToolCallsToMetaTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/guide-uncallable-tool-calls-to-meta-tool.util';

const DIRECTLY_CALLABLE = new Set(['execute_tool', 'learn_tools']);

const buildToolPart = (
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'tool-extract_json_paths',
    toolCallId: 'call_1',
    input: { fileId: 'abc' },
    state: 'output-error',
    errorText: "Model tried to call unavailable tool 'extract_json_paths'.",
    ...overrides,
  }) as ExtendedUIMessagePart;

const errorTextOf = (part: ExtendedUIMessagePart): string =>
  (part as { errorText: string }).errorText;

describe('guideUncallableToolCallsToMetaTool', () => {
  it('appends learn_tools -> execute_tool guidance for a direct call to an uncallable tool', () => {
    const [part] = guideUncallableToolCallsToMetaTool(
      [buildToolPart()],
      DIRECTLY_CALLABLE,
    );

    expect(errorTextOf(part)).toContain(
      'learn_tools({ toolNames: ["extract_json_paths"] })',
    );
    expect(errorTextOf(part)).toContain(
      'execute_tool({ toolName: "extract_json_paths", arguments: { ... } })',
    );
  });

  it('reads the tool name from a dynamic-tool part', () => {
    const [part] = guideUncallableToolCallsToMetaTool(
      [
        buildToolPart({
          type: 'dynamic-tool',
          toolName: 'search_output',
          errorText: 'Tool execution was interrupted.',
        }),
      ],
      DIRECTLY_CALLABLE,
    );

    expect(errorTextOf(part)).toContain(
      'execute_tool({ toolName: "search_output", arguments: { ... } })',
    );
  });

  it('leaves failures of directly callable tools untouched', () => {
    const part = buildToolPart({
      type: 'tool-execute_tool',
      errorText: 'Tool "foo" not found.',
    });

    expect(
      guideUncallableToolCallsToMetaTool([part], DIRECTLY_CALLABLE),
    ).toEqual([part]);
  });

  it('leaves successful tool parts untouched', () => {
    const part = buildToolPart({
      state: 'output-available',
      output: { ok: true },
      errorText: undefined,
    });

    expect(
      guideUncallableToolCallsToMetaTool([part], DIRECTLY_CALLABLE),
    ).toEqual([part]);
  });

  it('leaves non-tool parts untouched', () => {
    const parts = [{ type: 'text', text: 'hello' }] as ExtendedUIMessagePart[];

    expect(
      guideUncallableToolCallsToMetaTool(parts, DIRECTLY_CALLABLE),
    ).toEqual(parts);
  });
});
