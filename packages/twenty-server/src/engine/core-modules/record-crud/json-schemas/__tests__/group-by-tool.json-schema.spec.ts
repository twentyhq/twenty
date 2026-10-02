import { FieldMetadataType } from 'twenty-shared/types';

import {
  generateGroupByToolInputSchema,
  hasGroupByToolInputSchema,
} from 'src/engine/core-modules/record-crud/json-schemas/group-by-tool.json-schema';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const buildField = (
  overrides: Pick<FlatFieldMetadata, 'name' | 'type'> &
    Partial<FlatFieldMetadata>,
) =>
  getFlatFieldMetadataMock({
    id: `field-id-${overrides.name}`,
    universalIdentifier: overrides.name,
    objectMetadataId: 'object-metadata-id',
    ...overrides,
  });

const FIELDS = [
  buildField({
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
  buildField({ name: 'aliases', type: FieldMetadataType.ARRAY }),
  buildField({ name: 'name', type: FieldMetadataType.TEXT }),
  buildField({ name: 'createdAt', type: FieldMetadataType.DATE_TIME }),
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
    expect(hasGroupByToolInputSchema({ objectMetadata: { fields: [] } })).toBe(
      false,
    );
  });
});
