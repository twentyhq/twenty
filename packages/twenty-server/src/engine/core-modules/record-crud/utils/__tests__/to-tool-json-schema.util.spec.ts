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

  it('shares only schemas that declare an id', () => {
    const filterSchema = z
      .object({ field: z.string() })
      .meta({ id: 'testFilter' });
    const schema = z.object({
      first: filterSchema,
      second: filterSchema.optional(),
      label: z.string(),
    });

    expect(toToolJsonSchema(schema)).toEqual({
      type: 'object',
      properties: {
        first: { $ref: '#/$defs/testFilter' },
        second: { $ref: '#/$defs/testFilter' },
        label: { type: 'string' },
      },
      required: ['first', 'label'],
      $defs: {
        testFilter: {
          type: 'object',
          properties: { field: { type: 'string' } },
          required: ['field'],
        },
      },
    });
  });
});
