import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import {
  checkFields,
  getFieldType,
} from 'src/engine/api/rest/api-rest-query-builder/utils/fields.utils';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

describe('FieldUtils', () => {
  describe('getFieldType', () => {
    it('should get field type', () => {
      expect(getFieldType(objectMetadataItemMock, 'fieldNumber')).toEqual(
        FieldMetadataType.NUMBER,
      );
    });
  });

  describe('checkFields', () => {
    it('should check field types', () => {
      expect(() =>
        checkFields(objectMetadataItemMock, ['fieldNumber']),
      ).not.toThrow();

      expect(() =>
        checkFields(objectMetadataItemMock, ['wrongField']),
      ).toThrow();

      expect(() =>
        checkFields(objectMetadataItemMock, ['fieldNumber', 'wrongField']),
      ).toThrow();
    });
  });
});
