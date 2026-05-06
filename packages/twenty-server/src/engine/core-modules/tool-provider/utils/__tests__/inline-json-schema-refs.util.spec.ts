import { jsonSchema, type ToolSet } from 'ai';
import { type JSONSchema7 } from 'json-schema';

import {
  inlineJsonSchemaRefs,
  inlineToolSetInputSchemaRefs,
} from 'src/engine/core-modules/tool-provider/utils/inline-json-schema-refs.util';

describe('inlineJsonSchemaRefs', () => {
  it('inlines local $defs references and removes definitions', () => {
    const schema = {
      type: 'object',
      properties: {
        filters: {
          type: 'array',
          items: { $ref: '#/$defs/filter' },
        },
      },
      $defs: {
        filter: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            value: { $ref: '#/$defs/filterValue' },
          },
          required: ['field'],
        },
        filterValue: {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        },
      },
    } satisfies JSONSchema7;

    expect(inlineJsonSchemaRefs(schema)).toEqual({
      type: 'object',
      properties: {
        filters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              value: {
                anyOf: [{ type: 'string' }, { type: 'number' }],
              },
            },
            required: ['field'],
          },
        },
      },
    });
  });

  it('inlines tool input schemas wrapped with ai jsonSchema', () => {
    const toolSet = {
      search: {
        description: 'Search',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            query: { $ref: '#/$defs/query' },
          },
          $defs: {
            query: { type: 'string' },
          },
        }),
      },
    } satisfies ToolSet;

    const inlinedToolSet = inlineToolSetInputSchemaRefs(toolSet);

    expect(
      (inlinedToolSet.search.inputSchema as { jsonSchema: JSONSchema7 })
        .jsonSchema,
    ).toEqual({
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
    });
  });
});
