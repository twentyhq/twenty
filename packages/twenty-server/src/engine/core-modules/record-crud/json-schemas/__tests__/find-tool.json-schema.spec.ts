import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/json-schemas/find-tool.json-schema';
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

const COMPANY_FIELDS = [
  buildField({ name: 'name', type: FieldMetadataType.TEXT }),
  buildField({ name: 'address', type: FieldMetadataType.ADDRESS }),
  buildField({
    name: 'accountOwner',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
  }),
  buildField({
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    isSystem: true,
  }),
  buildField({
    name: 'deletedAt',
    type: FieldMetadataType.DATE_TIME,
    isSystem: true,
  }),
  buildField({
    name: 'people',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.ONE_TO_MANY },
  }),
];

const generateSchema = (restrictedFields = {}) =>
  generateFindToolInputSchema({
    objectMetadata: { fields: COMPANY_FIELDS },
    restrictedFields,
  });

const DIRECTION_REFERENCE = { $ref: '#/$defs/OrderByDirection' };

describe('generateFindToolInputSchema', () => {
  it('should sort scalar and many-to-one fields by direction and composite fields by sub-field', () => {
    expect(generateSchema()).toMatchObject({
      properties: {
        orderBy: {
          items: {
            properties: {
              name: DIRECTION_REFERENCE,
              accountOwnerId: DIRECTION_REFERENCE,
              createdAt: DIRECTION_REFERENCE,
              address: {
                properties: {
                  addressCity: DIRECTION_REFERENCE,
                  addressCountry: DIRECTION_REFERENCE,
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        },
      },
    });
  });

  it('should not offer sorting on one-to-many, deleted-at or unreadable fields', () => {
    expect(
      generateSchema({ 'field-id-name': { canRead: false } }),
    ).toMatchObject({
      properties: {
        orderBy: {
          items: {
            properties: expect.not.objectContaining({
              people: expect.anything(),
              deletedAt: expect.anything(),
              name: expect.anything(),
            }),
          },
        },
      },
    });
  });

  it('should expose field filters and logical operators as arguments', () => {
    expect(generateSchema()).toMatchObject({
      properties: {
        name: { $ref: '#/$defs/TextFilter' },
        accountOwnerId: { $ref: '#/$defs/UuidFilter' },
        or: { items: { $ref: '#/$defs/RecordFilter' } },
        not: { $ref: '#/$defs/RecordFilter' },
      },
      required: ['select'],
    });
  });

  it('should not offer filtering on unreadable fields', () => {
    expect(
      generateSchema({ 'field-id-name': { canRead: false } }).properties?.name,
    ).toBeUndefined();
  });
});
