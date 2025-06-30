import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDefaultSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  fieldCurrencyMock,
  fieldNumberMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
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
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const typedFieldTextMock: FieldMetadataInterface = {
    id: 'field-text-id',
    name: fieldTextMock.name,
    type: fieldTextMock.type,
    label: 'Field Text',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldTextMock.isNullable,
    defaultValue: fieldTextMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const typedFieldCurrencyMock: FieldMetadataInterface = {
    id: 'field-currency-id',
    name: fieldCurrencyMock.name,
    type: fieldCurrencyMock.type,
    label: 'Field Currency',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldCurrencyMock.isNullable,
    defaultValue: fieldCurrencyMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fieldsById: FieldMetadataMap = {
    'field-number-id': typedFieldNumberMock,
    'field-text-id': typedFieldTextMock,
    'field-currency-id': typedFieldCurrencyMock,
  };

  const typedObjectMetadataItem: ObjectMetadataItemWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldIdByName: {
      [typedFieldNumberMock.name]: typedFieldNumberMock.id,
      [typedFieldTextMock.name]: typedFieldTextMock.id,
      [typedFieldCurrencyMock.name]: typedFieldCurrencyMock.id,
    },
    fieldIdByJoinColumnName: {},
    indexMetadatas: [],
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
          isNullable: true,
          isLabelSyncedWithName: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (fieldMetadataType === FieldMetadataType.RELATION) {
          field.settings = {
            relationType: RelationType.MANY_TO_ONE,
          } as FieldMetadataDefaultSettings;
        }

        expect(
          mapFieldMetadataToGraphqlQuery(objectMetadataMapsMock, field),
        ).toBeDefined();
      });
    });
  });
});
