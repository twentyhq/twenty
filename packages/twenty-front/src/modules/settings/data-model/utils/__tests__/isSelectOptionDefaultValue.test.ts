import { FieldMetadataType } from '~/generated-metadata/graphql';

import { isSelectOptionDefaultValue } from '@/settings/data-model/utils/isSelectOptionDefaultValue';

describe('isSelectOptionDefaultValue', () => {
  describe('SELECT field', () => {
    it('returns true if the option value matches the default value', () => {
      // Given
      const optionValue = 'OPTION_1';
      const fieldMetadataItem = {
        defaultValue: `'${optionValue}'`,
        type: FieldMetadataType.SELECT,
      };

      // When
      const result = isSelectOptionDefaultValue(optionValue, fieldMetadataItem);

      // Then
      expect(result).toBe(true);
    });

    it('returns false if the option value does not match the default value', () => {
      // Given
      const optionValue = 'OPTION_1';
      const fieldMetadataItem = {
        defaultValue: "'OPTION_2'",
        type: FieldMetadataType.SELECT,
      };

      // When
      const result = isSelectOptionDefaultValue(optionValue, fieldMetadataItem);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('MULTI_SELECT field', () => {
    it('returns true if the option value is included in the default value array', () => {
      // Given
      const optionValue = 'OPTION_1';
      const fieldMetadataItem = {
        defaultValue: ["'OPTION_1'", "'OPTION_2'"],
        type: FieldMetadataType.MULTI_SELECT,
      };

      // When
      const result = isSelectOptionDefaultValue(optionValue, fieldMetadataItem);

      // Then
      expect(result).toBe(true);
    });

    it('returns false if the option value is not included in the default value array', () => {
      // Given
      const optionValue = 'OPTION_1';
      const fieldMetadataItem = {
        defaultValue: ["'OPTION_2'", "'OPTION_3'"],
        type: FieldMetadataType.MULTI_SELECT,
      };

      // When
      const result = isSelectOptionDefaultValue(optionValue, fieldMetadataItem);

      // Then
      expect(result).toBe(false);
    });
  });
});
