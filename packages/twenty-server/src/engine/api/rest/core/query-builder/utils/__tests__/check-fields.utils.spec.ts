import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  fieldNumberMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { checkFields } from 'src/engine/api/rest/core/query-builder/utils/check-fields.utils';
import { checkArrayFields } from 'src/engine/api/rest/core/query-builder/utils/check-order-by.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

describe('checkFields', () => {
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

  it('should check field types', () => {
    expect(() =>
      checkFields(mockObjectMetadataWithFieldMaps, ['fieldNumber']),
    ).not.toThrow();

    expect(() =>
      checkFields(mockObjectMetadataWithFieldMaps, ['wrongField']),
    ).toThrow();

    expect(() =>
      checkFields(mockObjectMetadataWithFieldMaps, [
        'fieldNumber',
        'wrongField',
      ]),
    ).toThrow();
  });

  it('should check field types from array of fields', () => {
    expect(() =>
      checkArrayFields(mockObjectMetadataWithFieldMaps, [
        { fieldNumber: undefined },
      ]),
    ).not.toThrow();

    expect(() =>
      checkArrayFields(mockObjectMetadataWithFieldMaps, [
        { wrongField: undefined },
      ]),
    ).toThrow();

    expect(() =>
      checkArrayFields(mockObjectMetadataWithFieldMaps, [
        { fieldNumber: undefined },
        { wrongField: undefined },
      ]),
    ).toThrow();
  });
});
