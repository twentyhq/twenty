import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  fieldSelectMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { checkFilterEnumValues } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/check-filter-enum-values';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

describe('checkFilterEnumValues', () => {
  const completeFieldSelectMock: FieldMetadataInterface = {
    id: 'field-select-id',
    type: fieldSelectMock.type,
    name: fieldSelectMock.name,
    label: 'Field Select',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldSelectMock.isNullable,
    defaultValue: fieldSelectMock.defaultValue,
    options: fieldSelectMock.options,
  };

  const fieldsById: FieldMetadataMap = {
    'field-select-id': completeFieldSelectMock,
  };

  const fieldsByName: FieldMetadataMap = {
    [completeFieldSelectMock.name]: completeFieldSelectMock,
  };

  const mockObjectMetadataWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldsByName,
    fieldsByJoinColumnName: {},
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
