import { FieldMetadataType } from 'twenty-shared/types';

import { generateGroupByToolInputSchema } from 'src/engine/core-modules/record-crud/json-schemas/group-by-tool.json-schema';
import { getToolSchemaFieldMock } from 'src/engine/core-modules/record-crud/__mocks__/get-tool-schema-field-mock';

const FIELDS = [
  getToolSchemaFieldMock({
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    options: [
      {
        id: 'radius',
        value: 'RADIUS',
        label: 'Radius',
        color: 'blue',
        position: 0,
      },
      { id: 'pam', value: 'PAM', label: 'PAM', color: 'red', position: 1 },
    ],
  }),
  getToolSchemaFieldMock({ name: 'aliases', type: FieldMetadataType.ARRAY }),
  getToolSchemaFieldMock({ name: 'name', type: FieldMetadataType.TEXT }),
  getToolSchemaFieldMock({
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
  }),
];

const buildUnnestEntry = (fieldName: string) => ({
  type: 'object',
  properties: {
    [fieldName]: {
      anyOf: [
        { type: 'boolean', const: true },
        {
          type: 'object',
          properties: { unnest: { type: 'boolean', const: true } },
          required: ['unnest'],
          additionalProperties: false,
        },
      ],
    },
  },
  required: [fieldName],
  additionalProperties: false,
});

describe('generateGroupByToolInputSchema', () => {
  it('should publish whole-array and strict unnest shapes for multi-value fields', () => {
    expect(
      generateGroupByToolInputSchema({ objectMetadata: { fields: FIELDS } }),
    ).toMatchObject({
      properties: {
        groupBy: {
          items: {
            anyOf: expect.arrayContaining([
              buildUnnestEntry('tags'),
              buildUnnestEntry('aliases'),
            ]),
          },
        },
      },
      additionalProperties: false,
    });
  });

  it('should group date fields through the shared date configuration', () => {
    expect(
      generateGroupByToolInputSchema({ objectMetadata: { fields: FIELDS } }),
    ).toMatchObject({
      properties: {
        groupBy: {
          items: {
            anyOf: expect.arrayContaining([
              expect.objectContaining({
                properties: { createdAt: { $ref: '#/$defs/DateGroupBy' } },
              }),
            ]),
          },
        },
      },
      $defs: { DateGroupBy: expect.objectContaining({ type: 'object' }) },
    });
  });

  it('should describe the unnest rule and overlapping group counts', () => {
    expect(
      generateGroupByToolInputSchema({ objectMetadata: { fields: FIELDS } }),
    ).toMatchObject({
      properties: {
        groupBy: {
          description: expect.stringMatching(
            /At most one entry can use unnest\..*totals can exceed the record count.*aliases \(multi-value,/,
          ),
        },
      },
    });
  });

  it('should omit unreadable fields from the grouping choices', () => {
    expect(
      generateGroupByToolInputSchema({
        objectMetadata: { fields: FIELDS },
        restrictedFields: { 'field-id-tags': { canRead: false } },
      }),
    ).toMatchObject({
      properties: {
        groupBy: {
          items: {
            anyOf: expect.not.arrayContaining([buildUnnestEntry('tags')]),
          },
        },
      },
    });
  });

  it('should not generate a schema when no field can be grouped by', () => {
    expect(
      generateGroupByToolInputSchema({ objectMetadata: { fields: [] } }),
    ).toBeNull();
  });
});
