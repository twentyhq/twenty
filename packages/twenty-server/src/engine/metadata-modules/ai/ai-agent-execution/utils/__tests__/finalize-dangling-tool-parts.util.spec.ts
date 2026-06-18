import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';

const buildToolPart = (
  state: string,
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'tool-execute_tool',
    toolCallId: 'call_1',
    input: { foo: 'bar' },
    state,
    ...overrides,
  }) as ExtendedUIMessagePart;

describe('finalizeDanglingToolParts', () => {
  it('returns an empty array unchanged', () => {
    expect(finalizeDanglingToolParts([])).toEqual([]);
  });

  it('rewrites an input-available tool part to an interrupted output-error', () => {
    const result = finalizeDanglingToolParts([
      buildToolPart('input-available'),
    ]);

    expect(result[0]).toEqual({
      type: 'tool-execute_tool',
      toolCallId: 'call_1',
      input: { foo: 'bar' },
      state: 'output-error',
      errorText: 'Tool execution was interrupted.',
    });
  });

  it('leaves a completed tool part untouched', () => {
    const part = buildToolPart('output-available', { output: { ok: true } });

    expect(finalizeDanglingToolParts([part])).toEqual([part]);
  });

  it('leaves an errored tool part with an input untouched', () => {
    const part = buildToolPart('output-error', { errorText: 'boom' });

    expect(finalizeDanglingToolParts([part])).toEqual([part]);
  });

  it('backfills an empty input for an output-error part missing its input', () => {
    const part = buildToolPart('output-error', {
      input: undefined,
      errorText: 'Invalid input for tool execute_tool: Type validation failed',
    });

    expect(finalizeDanglingToolParts([part])).toEqual([
      {
        type: 'tool-execute_tool',
        toolCallId: 'call_1',
        input: {},
        state: 'output-error',
        errorText:
          'Invalid input for tool execute_tool: Type validation failed',
      },
    ]);
  });

  it('preserves the existing error message when backfilling input', () => {
    const part = buildToolPart('output-error', {
      input: null,
      errorText: 'original validation error',
    });

    expect(finalizeDanglingToolParts([part])).toEqual([
      {
        type: 'tool-execute_tool',
        toolCallId: 'call_1',
        input: {},
        state: 'output-error',
        errorText: 'original validation error',
      },
    ]);
  });

  it('drops an input-streaming tool part with incomplete arguments', () => {
    const part = buildToolPart('input-streaming');

    expect(finalizeDanglingToolParts([part])).toEqual([]);
  });

  it('keeps surrounding parts when dropping an input-streaming part', () => {
    const text = { type: 'text', text: 'hello' } as ExtendedUIMessagePart;
    const streaming = buildToolPart('input-streaming');

    expect(finalizeDanglingToolParts([text, streaming])).toEqual([text]);
  });

  it('leaves non-tool parts untouched', () => {
    const parts = [
      { type: 'text', text: 'hello' },
      { type: 'reasoning', text: 'thinking' },
    ] as ExtendedUIMessagePart[];

    expect(finalizeDanglingToolParts(parts)).toEqual(parts);
  });

  it('finalizes only the dangling parts in a mixed batch', () => {
    const completed = buildToolPart('output-available', {
      toolCallId: 'call_done',
      output: { ok: true },
    });
    const dangling = buildToolPart('input-available', {
      toolCallId: 'call_pending',
    });

    const result = finalizeDanglingToolParts([completed, dangling]);

    expect(result[0]).toEqual(completed);
    expect(result[1]).toMatchObject({
      toolCallId: 'call_pending',
      state: 'output-error',
      errorText: 'Tool execution was interrupted.',
    });
  });
});
