import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { generateRecordPropertiesJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-properties.json-schema';
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
    description: null,
    ...overrides,
  });

const FIELDS = [
  buildField({ name: 'id', type: FieldMetadataType.UUID, isNullable: false }),
  buildField({
    name: 'name',
    type: FieldMetadataType.TEXT,
    isNullable: false,
    description: 'Deal name',
  }),
  buildField({ name: 'amount', type: FieldMetadataType.CURRENCY }),
  buildField({
    name: 'company',
    type: FieldMetadataType.RELATION,
    isNullable: false,
    settings: { relationType: RelationType.MANY_TO_ONE },
  }),
  buildField({
    name: 'tasks',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.ONE_TO_MANY },
  }),
];

describe('generateRecordPropertiesJsonSchema', () => {
  it('should describe writable fields and require the non-nullable ones', () => {
    expect(
      generateRecordPropertiesJsonSchema({
        objectMetadata: { fields: FIELDS },
        definitions: {},
      }),
    ).toEqual({
      properties: {
        name: { description: 'Deal name', type: 'string' },
        amount: { $ref: '#/$defs/CurrencyValue' },
        companyId: { $ref: '#/$defs/UuidValue' },
      },
      required: ['name', 'companyId'],
    });
  });

  it('should not require any field in a partial update', () => {
    expect(
      generateRecordPropertiesJsonSchema({
        objectMetadata: { fields: FIELDS },
        definitions: {},
        isPartial: true,
      }).required,
    ).toEqual([]);
  });

  it('should skip fields the role cannot update', () => {
    expect(
      generateRecordPropertiesJsonSchema({
        objectMetadata: { fields: FIELDS },
        definitions: {},
        restrictedFields: { 'field-id-name': { canUpdate: false } },
      }).properties,
    ).not.toHaveProperty('name');
  });
});
