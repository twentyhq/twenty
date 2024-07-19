import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getFieldType } from 'src/engine/api/rest/core/query-builder/utils/get-field-type.utils';

describe('getFieldType', () => {
  it('should get field type', () => {
    expect(getFieldType(objectMetadataItemMock, 'fieldNumber')).toEqual(
      FieldMetadataType.NUMBER,
    );
  });
});
