import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  fieldNumberMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { getFieldType } from 'src/engine/api/rest/core/query-builder/utils/get-field-type.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

describe('getFieldType', () => {
  const completeFieldNumberMock: FieldMetadataInterface = {
    id: 'field-number-id',
    type: fieldNumberMock.type,
    name: fieldNumberMock.name,
    label: 'Field Number',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldNumberMock.isNullable,
    defaultValue: fieldNumberMock.defaultValue,
  };

  const fieldsById: FieldMetadataMap = {
    'field-number-id': completeFieldNumberMock,
  };

  const fieldsByName: FieldMetadataMap = {
    [completeFieldNumberMock.name]: completeFieldNumberMock,
  };

  const mockObjectMetadataWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldsByName,
    fieldsByJoinColumnName: {},
  };

  it('should get field type', () => {
    expect(
      getFieldType(mockObjectMetadataWithFieldMaps, 'fieldNumber'),
    ).toEqual(FieldMetadataType.NUMBER);
  });
});
