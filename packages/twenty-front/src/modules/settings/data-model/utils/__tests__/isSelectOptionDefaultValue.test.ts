import { FieldMetadataType } from '~/generated/graphql';

import { isSelectOptionDefaultValue } from '../isSelectOptionDefaultValue';

describe('isSelectOptionDefaultValue', () => {
  describe('SELECT field', () => {
    it('returns true if the option value matches the default value', () => {
      // Given
      const optionValue = 'OPTION_1';
      const fieldMetadataItem = {
        defaultValue: `'${optionValue}'`,
        type: FieldMetadataType.Select,
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
        type: FieldMetadataType.Select,
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
        type: FieldMetadataType.MultiSelect,
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
        type: FieldMetadataType.MultiSelect,
      };

      // When
      const result = isSelectOptionDefaultValue(optionValue, fieldMetadataItem);

      // Then
      expect(result).toBe(false);
    });
  });
});
