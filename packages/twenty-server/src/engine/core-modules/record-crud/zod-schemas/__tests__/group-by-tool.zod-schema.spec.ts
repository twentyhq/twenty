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
        id: 'field-id-aliases',
        name: 'aliases',
        type: FieldMetadataType.ARRAY,
        isSystem: false,
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

describe('generateGroupByToolInputSchema multi-value unnest', () => {
  it.each(['tags', 'aliases'])(
    'accepts whole-array grouping on %s',
    (fieldName) => {
      const schema = generateGroupByToolInputSchema(buildObjectMetadata());

      expect(schema).not.toBeNull();
      expect(schema!.parse({ groupBy: [{ [fieldName]: true }] })).toMatchObject(
        {
          groupBy: [{ [fieldName]: true }],
        },
      );
    },
  );

  it.each(['tags', 'aliases'])(
    'accepts the unnest opt-in on %s',
    (fieldName) => {
      const schema = generateGroupByToolInputSchema(buildObjectMetadata());

      expect(schema).not.toBeNull();
      expect(
        schema!.parse({ groupBy: [{ [fieldName]: { unnest: true } }] }),
      ).toMatchObject({
        groupBy: [{ [fieldName]: { unnest: true } }],
      });
    },
  );

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

  it.each([{ unnest: false }, { unnest: true, extra: true }])(
    'rejects an invalid advertised unnest shape: %j',
    (definition) => {
      const schema = generateGroupByToolInputSchema(buildObjectMetadata());

      expect(
        schema!.safeParse({ groupBy: [{ tags: definition }] }).success,
      ).toBe(false);
    },
  );

  it('omits unreadable fields from the advertised grouping choices', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata(), {
      'field-id-tags': { canRead: false },
    });

    expect(schema).not.toBeNull();
    expect(toToolJsonSchema(schema!)).toMatchObject({
      properties: {
        groupBy: {
          items: {
            anyOf: expect.not.arrayContaining([
              expect.objectContaining({
                properties: { tags: expect.anything() },
              }),
            ]),
          },
        },
      },
    });
  });

  it.each(['tags', 'aliases'])(
    'publishes whole-array and strict unnest shapes for %s',
    (fieldName) => {
      const schema = generateGroupByToolInputSchema(buildObjectMetadata());

      expect(schema).not.toBeNull();
      expect(toToolJsonSchema(schema!)).toMatchObject({
        properties: {
          groupBy: {
            items: {
              anyOf: expect.arrayContaining([
                expect.objectContaining({
                  properties: {
                    [fieldName]: {
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
    },
  );

  it('describes the single-unnest rule and overlapping group counts', () => {
    const schema = generateGroupByToolInputSchema(buildObjectMetadata());
    const jsonSchema = toToolJsonSchema(schema!);

    expect(jsonSchema).toMatchObject({
      properties: {
        groupBy: {
          description: expect.stringContaining(
            'At most one entry can use unnest.',
          ),
        },
      },
    });
    expect(jsonSchema).toMatchObject({
      properties: {
        groupBy: {
          description: expect.stringContaining(
            'totals can exceed the record count',
          ),
        },
      },
    });
    expect(jsonSchema).toMatchObject({
      properties: {
        groupBy: {
          description: expect.stringContaining('aliases (multi-value,'),
        },
      },
    });
  });
});
