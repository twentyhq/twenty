import { FieldMetadataType } from 'twenty-shared/types';

import {
  fieldSelectMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { checkFilterEnumValues } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/check-filter-enum-values';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('checkFilterEnumValues', () => {
  const completeFieldSelectMock = getMockFieldMetadataEntity({
    workspaceId: '20202020-0000-0000-0000-000000000000',
    objectMetadataId: '20202020-0000-0000-0000-000000000001',
    id: 'field-select-id',
    type: fieldSelectMock.type,
    name: fieldSelectMock.name,
    label: 'Field Select',
    isNullable: fieldSelectMock.isNullable,
    defaultValue: fieldSelectMock.defaultValue,
    options: fieldSelectMock.options,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const fieldsById: FieldMetadataMap = {
    'field-select-id': completeFieldSelectMock,
  };

  const mockObjectMetadataWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldIdByName: {
      [completeFieldSelectMock.name]: completeFieldSelectMock.id,
    },
    fieldIdByJoinColumnName: {},
    indexMetadatas: [],
  };

  it('should check properly', () => {
    expect(() =>
      checkFilterEnumValues(
        FieldMetadataType.SELECT,
        fieldSelectMock.name,
        'OPTION_1',
        mockObjectMetadataWithFieldMaps,
      ),
    ).not.toThrow();

    expect(() =>
      checkFilterEnumValues(
        FieldMetadataType.SELECT,
        fieldSelectMock.name,
        'MISSING_OPTION',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toThrow(
      `'filter' enum value 'MISSING_OPTION' not available in '${fieldSelectMock.name}' enum. Available enum values are ['OPTION_1', 'OPTION_2']`,
    );
  });

  it('should allow filter by NULL or NOT_NULL values', () => {
    expect(() =>
      checkFilterEnumValues(
        FieldMetadataType.SELECT,
        fieldSelectMock.name,
        'NULL',
        mockObjectMetadataWithFieldMaps,
      ),
    ).not.toThrow();

    expect(() =>
      checkFilterEnumValues(
        FieldMetadataType.SELECT,
        fieldSelectMock.name,
        'NOT_NULL',
        mockObjectMetadataWithFieldMaps,
      ),
    ).not.toThrow();
  });
});
