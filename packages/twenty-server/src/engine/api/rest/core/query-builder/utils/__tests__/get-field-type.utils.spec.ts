import { FieldMetadataType } from 'twenty-shared';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { getFieldType } from 'src/engine/api/rest/core/query-builder/utils/get-field-type.utils';

describe('getFieldType', () => {
  it('should get field type', () => {
    expect(getFieldType(objectMetadataItemMock, 'fieldNumber')).toEqual(
      FieldMetadataType.NUMBER,
    );
  });
});
