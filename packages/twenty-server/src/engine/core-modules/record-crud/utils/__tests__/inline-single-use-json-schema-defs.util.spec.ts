import { inlineSingleUseJsonSchemaDefs } from 'src/engine/core-modules/record-crud/utils/inline-single-use-json-schema-defs.util';

describe('inlineSingleUseJsonSchemaDefs', () => {
  it('returns the schema untouched when it has no $defs', () => {
    const schema = { type: 'object', properties: { name: { type: 'string' } } };

    expect(inlineSingleUseJsonSchemaDefs(schema)).toEqual(schema);
  });

  it('inlines a def referenced once and keeps sibling keywords', () => {
    expect(
      inlineSingleUseJsonSchemaDefs({
        type: 'object',
        properties: {
          includeRules: {
            description: 'Include rules',
            $ref: '#/$defs/__schema0',
          },
        },
        $defs: { __schema0: { type: 'boolean' } },
      }),
    ).toEqual({
      type: 'object',
      properties: {
        includeRules: { type: 'boolean', description: 'Include rules' },
      },
    });
  });

  it('keeps shared defs as refs and renumbers them sequentially', () => {
    expect(
      inlineSingleUseJsonSchemaDefs({
        type: 'object',
        properties: {
          label: { $ref: '#/$defs/__schema0' },
          sourceId: { $ref: '#/$defs/__schema3' },
          targetId: { $ref: '#/$defs/__schema3' },
        },
        $defs: {
          __schema0: { type: 'string' },
          __schema3: { type: 'string', format: 'uuid' },
        },
      }),
    ).toEqual({
      type: 'object',
      properties: {
        label: { type: 'string' },
        sourceId: { $ref: '#/$defs/__schema0' },
        targetId: { $ref: '#/$defs/__schema0' },
      },
      $defs: { __schema0: { type: 'string', format: 'uuid' } },
    });
  });

  it('inlines single-use defs nested inside a shared recursive def', () => {
    expect(
      inlineSingleUseJsonSchemaDefs({
        $ref: '#/$defs/__schema1',
        $defs: {
          __schema0: { type: 'string' },
          __schema1: {
            type: 'object',
            properties: {
              name: { $ref: '#/$defs/__schema0' },
              children: {
                type: 'array',
                items: { $ref: '#/$defs/__schema1' },
              },
            },
          },
        },
      }),
    ).toEqual({
      $ref: '#/$defs/__schema0',
      $defs: {
        __schema0: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/$defs/__schema0' },
            },
          },
        },
      },
    });
  });
});
