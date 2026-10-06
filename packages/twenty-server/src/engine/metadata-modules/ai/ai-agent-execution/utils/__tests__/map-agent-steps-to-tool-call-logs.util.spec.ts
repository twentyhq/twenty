import { type StepResult, type ToolSet } from 'ai';

import { mapAgentStepsToToolCallLogs } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-steps-to-tool-call-logs.util';

type StepContentPart = StepResult<ToolSet>['content'][number];

const buildStep = (content: StepContentPart[]): StepResult<ToolSet> =>
  ({ content }) as unknown as StepResult<ToolSet>;

describe('mapAgentStepsToToolCallLogs', () => {
  it('returns an empty array when there are no steps', () => {
    expect(mapAgentStepsToToolCallLogs([])).toEqual([]);
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

    const result = mapAgentStepsToToolCallLogs(steps);

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

    const result = mapAgentStepsToToolCallLogs(steps);

    expect(result).toHaveLength(1);
    expect(result[0].state).toBe('error');
    expect(result[0].errorMessage).toContain('Validation failed');
  });

  it('marks a tool-result whose output reports a failure as error', () => {
    const output = {
      success: false,
      message: 'Failed to execute create_view',
      error: 'View not found',
    };
    const steps = [
      buildStep([
        {
          type: 'tool-call',
          toolName: 'create_view',
          toolCallId: 'call_3',
          input: {},
        } as StepContentPart,
        {
          type: 'tool-result',
          toolName: 'create_view',
          toolCallId: 'call_3',
          input: {},
          output,
        } as StepContentPart,
      ]),
    ];

    expect(mapAgentStepsToToolCallLogs(steps)[0]).toMatchObject({
      state: 'error',
      errorMessage: 'View not found',
      output,
    });
  });

  it('truncates oversized tool input and output', () => {
    const longString = 'x'.repeat(100_000);

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

    const result = mapAgentStepsToToolCallLogs(steps);

    const serializedInput = JSON.stringify(result[0].input);
    const serializedOutput = JSON.stringify(result[0].output);

    expect(serializedInput.length).toBeLessThan(33_000);
    expect(serializedInput).toContain('truncated');
    expect(serializedOutput.length).toBeLessThan(65_000);
    expect(serializedOutput).toContain('truncated');
  });

  it('stops collecting tool calls past the cap, across steps', () => {
    const buildToolCalls = (stepIndex: number) =>
      Array.from(
        { length: 150 },
        (_, callIndex) =>
          ({
            type: 'tool-call',
            toolName: 'noop',
            toolCallId: `call_${stepIndex}_${callIndex}`,
            input: {},
          }) as StepContentPart,
      );

    const steps = [buildStep(buildToolCalls(0)), buildStep(buildToolCalls(1))];

    expect(mapAgentStepsToToolCallLogs(steps)).toHaveLength(200);
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

    const result = mapAgentStepsToToolCallLogs(steps);
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

    const result = mapAgentStepsToToolCallLogs(steps);
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

    const result = mapAgentStepsToToolCallLogs(steps);

    expect(result).toHaveLength(1);
    expect(result[0].toolName).toBe('foo');
  });
});
