import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { generateGroupByToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/group-by-tool.zod-schema';

const buildObjectMetadata = (): ObjectMetadataForToolSchema => {
  return {
    fields: [
      {
        id: 'field-id-tags',
        name: 'tags',
        type: FieldMetadataType.MULTI_SELECT,
        isSystem: false,
        options: [{ value: 'RADIUS' }, { value: 'PAM' }],
      },
      {
        id: 'field-id-name',
        name: 'name',
        type: FieldMetadataType.TEXT,
        isSystem: false,
      },
    ],
  } as unknown as ObjectMetadataForToolSchema;
};

describe('generateGroupByToolInputSchema multi-select unnest', () => {
  it('accepts whole-array grouping on a multi-select field', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());

    expect(schema).not.toBeNull();
    expect(schema!.parse({ groupBy: [{ tags: true }] })).toMatchObject({
      groupBy: [{ tags: true }],
    });
  });

  it('accepts the unnest opt-in on a multi-select field', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());

    expect(schema).not.toBeNull();
    expect(
      schema!.parse({ groupBy: [{ tags: { unnest: true } }] }),
    ).toMatchObject({
      groupBy: [{ tags: { unnest: true } }],
    });
  });

  it('accepts unnest together with a second grouping dimension', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());

    expect(
      schema!.parse({
        groupBy: [{ tags: { unnest: true } }, { name: true }],
      }),
    ).toMatchObject({
      groupBy: [{ tags: { unnest: true } }, { name: true }],
    });
  });

  it.each([
    false,
    {},
    { unnest: false },
    { unnest: 'true' },
    { unnest: true, extra: true },
  ])(
    'rejects an invalid multi-select grouping definition: %j',
    (definition) => {
      const schema = generateGroupByToolInputSchema(buildObjectMetadata());

      expect(
        schema!.safeParse({ groupBy: [{ tags: definition }] }).success,
      ).toBe(false);
    },
  );

  it('rejects multiple field keys in a single grouping entry', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());

    expect(
      schema!.safeParse({
        groupBy: [{ tags: { unnest: true }, name: true }],
      }).success,
    ).toBe(false);
  });

  it('rejects the unnest opt-in on an ordinary field', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());

    expect(schema).not.toBeNull();
    expect(() =>
      schema!.parse({ groupBy: [{ name: { unnest: true } }] }),
    ).toThrow();
  });

  it.each([true, { unnest: true }])(
    'rejects grouping on a multi-select field without read permission: %j',
    (definition) => {
      const schema = generateGroupByToolInputSchema(buildObjectMetadata(), {
        'field-id-tags': { canRead: false },
      });

      expect(schema).not.toBeNull();
      expect(
        schema!.safeParse({ groupBy: [{ tags: definition }] }).success,
      ).toBe(false);
    },
  );

  it('publishes both whole-array and strict unnest input shapes in the JSON tool schema', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());

    expect(schema).not.toBeNull();
    expect(toToolJsonSchema(schema!)).toMatchObject({
      properties: {
        groupBy: {
          items: {
            anyOf: expect.arrayContaining([
              expect.objectContaining({
                properties: {
                  tags: {
                    anyOf: expect.arrayContaining([
                      expect.objectContaining({
                        type: 'boolean',
                        const: true,
                      }),
                      expect.objectContaining({
                        type: 'object',
                        properties: {
                          unnest: { type: 'boolean', const: true },
                        },
                        required: ['unnest'],
                        additionalProperties: false,
                      }),
                    ]),
                  },
                },
              }),
            ]),
          },
        },
      },
    });
  });
});
