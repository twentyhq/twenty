import { z } from 'zod';

import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';

describe('toToolJsonSchema', () => {
  it('inlines described optional fields instead of hoisting them into $defs', () => {
    const schema = z.object({
      includeRules: z.boolean().optional().describe('Include rules'),
    });

    expect(toToolJsonSchema(schema)).toEqual({
      type: 'object',
      properties: {
        includeRules: { type: 'boolean', description: 'Include rules' },
      },
    });
  });

  it('emits discriminated unions as anyOf', () => {
    const schema = z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('a') }),
      z.object({ kind: z.literal('b') }),
    ]);

    const result = toToolJsonSchema(schema);

    expect(result).not.toHaveProperty('oneOf');
    expect(result).toHaveProperty('anyOf', [
      expect.objectContaining({
        properties: { kind: { type: 'string', const: 'a' } },
      }),
      expect.objectContaining({
        properties: { kind: { type: 'string', const: 'b' } },
      }),
    ]);
  });
});
