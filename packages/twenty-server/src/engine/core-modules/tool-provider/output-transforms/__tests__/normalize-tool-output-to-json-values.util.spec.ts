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

  it('strips NUL characters from string values', () => {
    expect(
      normalizeToolOutputToJsonValues({
        success: true,
        message: 'Request successful',
        result: { body: 'PK\u0003\u0004\u0000\u0000', rows: [['A\u0000']] },
      }),
    ).toEqual({
      success: true,
      message: 'Request successful',
      result: { body: 'PK\u0003\u0004', rows: [['A']] },
    });
  });

  it('keeps a literal backslash followed by u0000', () => {
    const literalEscapeOutput = {
      success: true,
      message: 'Code executed',
      result: { code: 'split("\\u0000")' },
    };

    expect(normalizeToolOutputToJsonValues(literalEscapeOutput)).toEqual(
      literalEscapeOutput,
    );
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
