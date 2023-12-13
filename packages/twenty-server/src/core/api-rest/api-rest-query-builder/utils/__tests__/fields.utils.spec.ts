import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';
import {
  checkFields,
  getFieldType,
} from 'src/core/api-rest/api-rest-query-builder/utils/fields.utils';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

describe('FieldUtils', () => {
  describe('getFieldType', () => {
    it('should get field type', () => {
      expect(getFieldType(objectMetadataItem, 'fieldNumber')).toEqual(
        FieldMetadataType.NUMBER,
      );
    });
  });

  describe('checkFields', () => {
    it('should check field types', () => {
      expect(() =>
        checkFields(objectMetadataItem, ['fieldNumber']),
      ).not.toThrow();

      expect(() => checkFields(objectMetadataItem, ['wrongField'])).toThrow();

      expect(() =>
        checkFields(objectMetadataItem, ['fieldNumber', 'wrongField']),
      ).toThrow();
    });
  });
});
