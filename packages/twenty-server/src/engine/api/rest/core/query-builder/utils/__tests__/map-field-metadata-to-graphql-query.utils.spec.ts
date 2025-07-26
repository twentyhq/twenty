import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
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
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('mapFieldMetadataToGraphqlQuery', () => {
  const typedFieldNumberMock = getMockFieldMetadataEntity({
    workspaceId: '20202020-0000-0000-0000-000000000000',
    objectMetadataId: '20202020-0000-0000-0000-000000000001',
    id: '20202020-0000-0000-0000-000000000002',
    name: fieldNumberMock.name,
    type: fieldNumberMock.type,
    label: 'Field Number',
    isNullable: fieldNumberMock.isNullable,
    defaultValue: fieldNumberMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const typedFieldTextMock = getMockFieldMetadataEntity({
    workspaceId: '20202020-0000-0000-0000-000000000000',
    objectMetadataId: '20202020-0000-0000-0000-000000000001',
    id: '20202020-0000-0000-0000-000000000003',
    name: fieldTextMock.name,
    type: fieldTextMock.type,
    label: 'Field Text',
    isNullable: fieldTextMock.isNullable,
    defaultValue: fieldTextMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const typedFieldCurrencyMock = getMockFieldMetadataEntity({
    workspaceId: '20202020-0000-0000-0000-000000000000',
    objectMetadataId: '20202020-0000-0000-0000-000000000001',
    id: '20202020-0000-0000-0000-000000000004',
    name: fieldCurrencyMock.name,
    type: fieldCurrencyMock.type,
    label: 'Field Currency',
    isNullable: fieldCurrencyMock.isNullable,
    defaultValue: fieldCurrencyMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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
        const field = getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          id: '20202020-0000-0000-0000-000000000005',
          type: fieldMetadataType,
          name: 'toObjectMetadataName',
          label: 'Test Field',
          isNullable: true,
          isLabelSyncedWithName: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings:
            fieldMetadataType === FieldMetadataType.RELATION ||
            fieldMetadataType === FieldMetadataType.MORPH_RELATION
              ? ({
                  relationType: RelationType.MANY_TO_ONE,
                } as FieldMetadataRelationSettings)
              : null,
        });

        expect(
          mapFieldMetadataToGraphqlQuery(objectMetadataMapsMock, field),
        ).toBeDefined();
      });
    });
  });
});
