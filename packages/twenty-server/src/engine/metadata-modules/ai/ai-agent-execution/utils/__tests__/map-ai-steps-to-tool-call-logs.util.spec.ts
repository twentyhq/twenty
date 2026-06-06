import { type StepResult, type ToolSet } from 'ai';

import { mapAiStepsToToolCallLogs } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-tool-call-logs.util';

type StepContentPart = StepResult<ToolSet>['content'][number];

const buildStep = (content: StepContentPart[]): StepResult<ToolSet> =>
  ({ content }) as unknown as StepResult<ToolSet>;

describe('mapAiStepsToToolCallLogs', () => {
  it('returns an empty array when there are no steps', () => {
    expect(mapAiStepsToToolCallLogs([])).toEqual([]);
  });

  it('pairs a tool-call with its tool-result into a single success entry', () => {
    const steps = [
      buildStep([
        {
          type: 'tool-call',
          toolName: 'findRecords',
          toolCallId: 'call_1',
          input: { limit: 10 },
        } as StepContentPart,
        {
          type: 'tool-result',
          toolName: 'findRecords',
          toolCallId: 'call_1',
          input: { limit: 10 },
          output: { totalCount: 2 },
        } as StepContentPart,
      ]),
    ];

    const result = mapAiStepsToToolCallLogs(steps);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      toolName: 'findRecords',
      toolCallId: 'call_1',
      state: 'success',
      output: { totalCount: 2 },
    });
  });

  it('marks a tool-call followed by tool-error as error and records the message', () => {
    const steps = [
      buildStep([
        {
          type: 'tool-call',
          toolName: 'createNote',
          toolCallId: 'call_2',
          input: { title: 'x' },
        } as StepContentPart,
        {
          type: 'tool-error',
          toolName: 'createNote',
          toolCallId: 'call_2',
          input: { title: 'x' },
          error: new Error('Validation failed'),
        } as StepContentPart,
      ]),
    ];

    const result = mapAiStepsToToolCallLogs(steps);

    expect(result).toHaveLength(1);
    expect(result[0].state).toBe('error');
    expect(result[0].errorMessage).toContain('Validation failed');
  });

  it('truncates oversized tool input and output', () => {
    const longString = 'x'.repeat(50_000);

    const steps = [
      buildStep([
        {
          type: 'tool-call',
          toolName: 'fetchUrl',
          toolCallId: 'call_3',
          input: { html: longString },
        } as StepContentPart,
        {
          type: 'tool-result',
          toolName: 'fetchUrl',
          toolCallId: 'call_3',
          input: { html: longString },
          output: { body: longString },
        } as StepContentPart,
      ]),
    ];

    const result = mapAiStepsToToolCallLogs(steps, {
      maxToolInputBytes: 100,
      maxToolOutputBytes: 100,
    });

    const serializedInput = JSON.stringify(result[0].input);
    const serializedOutput = JSON.stringify(result[0].output);

    expect(serializedInput.length).toBeLessThan(200);
    expect(serializedInput).toContain('truncated');
    expect(serializedOutput.length).toBeLessThan(200);
    expect(serializedOutput).toContain('truncated');
  });

  it('stops collecting tool calls past the per-step cap', () => {
    const content: StepContentPart[] = [];

    for (let i = 0; i < 10; i++) {
      content.push({
        type: 'tool-call',
        toolName: 'noop',
        toolCallId: `call_${i}`,
        input: {},
      } as StepContentPart);
    }

    const steps = [buildStep(content)];

    const result = mapAiStepsToToolCallLogs(steps, {
      maxToolCallsPerStep: 3,
    });

    expect(result).toHaveLength(3);
  });

  it('preserves all web_search sources in tool output', () => {
    const manySources = Array.from({ length: 25 }, (_, index) => ({
      url: `https://example.com/${index}`,
      type: 'url',
    }));

    const steps = [
      buildStep([
        {
          type: 'tool-call',
          toolName: 'web_search',
          toolCallId: 'call_search',
          input: {},
        } as StepContentPart,
        {
          type: 'tool-result',
          toolName: 'web_search',
          toolCallId: 'call_search',
          input: {},
          output: {
            action: { type: 'search', query: 'twenty crm' },
            sources: manySources,
          },
        } as StepContentPart,
      ]),
    ];

    const result = mapAiStepsToToolCallLogs(steps);
    const output = result[0].output as {
      sources: unknown[];
      sourcesDroppedCount?: number;
    };

    expect(output.sources).toHaveLength(25);
    expect(output.sourcesDroppedCount).toBeUndefined();
  });

  it('strips searchVector from nested record outputs', () => {
    const steps = [
      buildStep([
        {
          type: 'tool-call',
          toolName: 'find_companies',
          toolCallId: 'call_find',
          input: {},
        } as StepContentPart,
        {
          type: 'tool-result',
          toolName: 'find_companies',
          toolCallId: 'call_find',
          input: {},
          output: {
            result: {
              count: '1',
              records: [
                {
                  id: 'abc',
                  name: 'Apple',
                  searchVector: "'apple':1 'inc':2",
                },
              ],
            },
          },
        } as StepContentPart,
      ]),
    ];

    const result = mapAiStepsToToolCallLogs(steps);
    const output = result[0].output as {
      result: { records: Array<Record<string, unknown>> };
    };

    expect(output.result.records[0]).not.toHaveProperty('searchVector');
    expect(output.result.records[0].name).toBe('Apple');
  });

  it('ignores text / reasoning / source parts', () => {
    const steps = [
      buildStep([
        { type: 'text', text: 'hello' } as StepContentPart,
        {
          type: 'reasoning',
          text: 'thinking…',
          state: 'done',
        } as StepContentPart,
        {
          type: 'tool-call',
          toolName: 'foo',
          toolCallId: 'call_only',
          input: {},
        } as StepContentPart,
      ]),
    ];

    const result = mapAiStepsToToolCallLogs(steps);

    expect(result).toHaveLength(1);
    expect(result[0].toolName).toBe('foo');
  });
});
