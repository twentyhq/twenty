import { modelMessageSchema } from 'ai';
import { z } from 'zod';

import { normalizeToolOutputToJsonValues } from 'src/engine/core-modules/tool-provider/output-transforms/normalize-tool-output-to-json-values.util';

const output = {
  success: true,
  message: 'Found 1 company records',
  result: {
    records: [
      {
        id: '1',
        name: 'Acme',
        createdAt: new Date('2026-09-14T09:15:22.895Z'),
      },
    ],
  },
};

const asToolMessages = (output: unknown) => [
  {
    role: 'tool',
    content: [
      {
        type: 'tool-result',
        toolCallId: 'call_1',
        toolName: 'execute_tool',
        output: { type: 'json', value: output },
      },
    ],
  },
];

describe('normalizeToolOutputToJsonValues', () => {
  it('turns dates into ISO strings', () => {
    expect(normalizeToolOutputToJsonValues(output)).toEqual({
      success: true,
      message: 'Found 1 company records',
      result: {
        records: [
          { id: '1', name: 'Acme', createdAt: '2026-09-14T09:15:22.895Z' },
        ],
      },
    });
  });
});

describe('tool output reaching the model', () => {
  it('is rejected by the ModelMessage schema when it carries a date', () => {
    expect(
      z.array(modelMessageSchema).safeParse(asToolMessages(output)).success,
    ).toBe(false);
  });

  it('is accepted once normalized', () => {
    expect(
      z
        .array(modelMessageSchema)
        .safeParse(asToolMessages(normalizeToolOutputToJsonValues(output)))
        .success,
    ).toBe(true);
  });
});

describe('normalizeToolOutputToJsonValues fallback', () => {
  it('keeps a bigint-bearing output JSON-safe', () => {
    const bigintOutput = {
      success: true,
      message: 'Found 1 company record',
      result: { records: [{ id: '1', externalId: 9007199254740993n }] },
    };

    const normalized = normalizeToolOutputToJsonValues(
      bigintOutput as never,
    ) as Record<string, any>;

    expect(() => JSON.stringify(normalized)).not.toThrow();
  });

  it('keeps a circular output JSON-safe', () => {
    const circularOutput: Record<string, any> = {
      success: true,
      message: 'Found 1 company record',
      result: { records: [{ id: '1' }] },
    };
    circularOutput.result.self = circularOutput;

    const normalized = normalizeToolOutputToJsonValues(
      circularOutput as never,
    ) as Record<string, any>;

    expect(() => JSON.stringify(normalized)).not.toThrow();
  });
});
