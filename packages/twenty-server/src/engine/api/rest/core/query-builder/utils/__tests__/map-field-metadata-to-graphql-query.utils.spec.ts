import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  fieldCurrencyMock,
  fieldNumberMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

describe('mapFieldMetadataToGraphqlQuery', () => {
  const typedFieldNumberMock: FieldMetadataInterface = {
    id: 'field-number-id',
    name: fieldNumberMock.name,
    type: fieldNumberMock.type,
    label: 'Field Number',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldNumberMock.isNullable,
    defaultValue: fieldNumberMock.defaultValue,
  };

  const typedFieldTextMock: FieldMetadataInterface = {
    id: 'field-text-id',
    name: fieldTextMock.name,
    type: fieldTextMock.type,
    label: 'Field Text',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldTextMock.isNullable,
    defaultValue: fieldTextMock.defaultValue,
  };

  const typedFieldCurrencyMock: FieldMetadataInterface = {
    id: 'field-currency-id',
    name: fieldCurrencyMock.name,
    type: fieldCurrencyMock.type,
    label: 'Field Currency',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldCurrencyMock.isNullable,
    defaultValue: fieldCurrencyMock.defaultValue,
  };

  const fieldsById: FieldMetadataMap = {
    'field-number-id': typedFieldNumberMock,
    'field-text-id': typedFieldTextMock,
    'field-currency-id': typedFieldCurrencyMock,
  };

  const fieldsByName: FieldMetadataMap = {
    [typedFieldNumberMock.name]: typedFieldNumberMock,
    [typedFieldTextMock.name]: typedFieldTextMock,
    [typedFieldCurrencyMock.name]: typedFieldCurrencyMock,
  };

  const typedObjectMetadataItem: ObjectMetadataItemWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldsByName,
    fieldsByJoinColumnName: {},
  };

  const objectMetadataMapsMock: ObjectMetadataMaps = {
    byId: {
      [objectMetadataItemMock.id]: typedObjectMetadataItem,
    },
    idByNameSingular: {
      [objectMetadataItemMock.nameSingular]: objectMetadataItemMock.id,
    },
  };

  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery(
        objectMetadataMapsMock,
        typedFieldNumberMock,
      ),
    ).toEqual('fieldNumber');
    expect(
      mapFieldMetadataToGraphqlQuery(
        objectMetadataMapsMock,
        typedFieldTextMock,
      ),
    ).toEqual('fieldText');
    expect(
      mapFieldMetadataToGraphqlQuery(
        objectMetadataMapsMock,
        typedFieldCurrencyMock,
      ),
    ).toEqual(`
      fieldCurrency
      {
        amountMicros
        currencyCode
      }
    `);
  });

  describe('should handle all field metadata types', () => {
    Object.values(FieldMetadataType).forEach((fieldMetadataType) => {
      it(`with field type ${fieldMetadataType}`, () => {
        const field: FieldMetadataInterface = {
          id: 'test-field-id',
          type: fieldMetadataType,
          name: 'toObjectMetadataName',
          label: 'Test Field',
          objectMetadataId: 'object-metadata-id',
          fromRelationMetadata: {
            relationType: RelationMetadataType.ONE_TO_MANY,
            toObjectMetadataId: objectMetadataItemMock.id,
          } as any,
        };

        expect(
          mapFieldMetadataToGraphqlQuery(objectMetadataMapsMock, field),
        ).toBeDefined();
      });
    });
  });
});
