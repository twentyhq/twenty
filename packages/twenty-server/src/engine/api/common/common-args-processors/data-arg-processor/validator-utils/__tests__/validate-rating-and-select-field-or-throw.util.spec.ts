import { validateRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rating-and-select-field-or-throw.util';

describe('validateRatingAndSelectFieldOrThrow', () => {
  const validOptions = ['option1', 'option2', 'option3'];

  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateRatingAndSelectFieldOrThrow(
        null,
        'testField',
        validOptions,
      );

      expect(result).toBeNull();
    });

    it('should return the string when value is a valid option', () => {
      const result = validateRatingAndSelectFieldOrThrow(
        'option1',
        'testField',
        validOptions,
      );

      expect(result).toBe('option1');
    });
  });

  describe('invalid inputs', () => {
    it('should throw when options is undefined', () => {
      expect(() =>
        validateRatingAndSelectFieldOrThrow('option1', 'testField', undefined),
      ).toThrow('Invalid options for field "testField"');
    });

    it('should throw when value is not in the options list', () => {
      expect(() =>
        validateRatingAndSelectFieldOrThrow(
          'invalidOption',
          'testField',
          validOptions,
        ),
      ).toThrow('Invalid value \'invalidOption\' for field "testField"');
    });

    it('should throw when value is a number', () => {
      expect(() =>
        validateRatingAndSelectFieldOrThrow(123, 'testField', validOptions),
      ).toThrow('Invalid string value 123 for text field "testField"');
    });
  });
});
