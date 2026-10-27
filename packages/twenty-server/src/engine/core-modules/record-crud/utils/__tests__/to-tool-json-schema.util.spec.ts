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

  it('keeps shared schemas as sequentially named refs', () => {
    const sharedId = z.uuid();
    const schema = z.object({
      label: z.string().optional().describe('Label'),
      sourceId: sharedId,
      targetId: sharedId,
    });

    const result = toToolJsonSchema(schema) as {
      properties: Record<string, unknown>;
      $defs: Record<string, unknown>;
    };

    expect(Object.keys(result.$defs)).toEqual(['__schema0']);
    expect(result.properties.sourceId).toEqual({ $ref: '#/$defs/__schema0' });
    expect(result.properties.targetId).toEqual({ $ref: '#/$defs/__schema0' });
    expect(result.properties.label).toEqual({
      type: 'string',
      description: 'Label',
    });
  });

  it('emits discriminated unions as anyOf', () => {
    const schema = z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('a') }),
      z.object({ kind: z.literal('b') }),
    ]);

    const result = toToolJsonSchema(schema) as Record<string, unknown>;

    expect(result.oneOf).toBeUndefined();
    expect(result.anyOf).toHaveLength(2);
  });
});
