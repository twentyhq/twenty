import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { generateRecordPropertiesJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-properties.json-schema';
import { getToolSchemaFieldMock } from 'src/engine/core-modules/record-crud/__mocks__/get-tool-schema-field-mock';

const FIELDS = [
  getToolSchemaFieldMock({
    name: 'id',
    type: FieldMetadataType.UUID,
    isNullable: false,
  }),
  getToolSchemaFieldMock({
    name: 'name',
    type: FieldMetadataType.TEXT,
    isNullable: false,
    description: 'Deal name',
  }),
  getToolSchemaFieldMock({ name: 'amount', type: FieldMetadataType.CURRENCY }),
  getToolSchemaFieldMock({
    name: 'company',
    type: FieldMetadataType.RELATION,
    isNullable: false,
    settings: { relationType: RelationType.MANY_TO_ONE },
  }),
  getToolSchemaFieldMock({
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
