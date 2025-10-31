import { coerceRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-rating-and-select-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

describe('coerceRatingAndSelectFieldOrThrow', () => {
  const validOptions = ['option1', 'option2', 'option3'];

  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceRatingAndSelectFieldOrThrow(
        null,
        validOptions,
        'testField',
      );

      expect(result).toBeNull();
    });

    it('should return null when value is an empty string', () => {
      const result = coerceRatingAndSelectFieldOrThrow(
        '',
        validOptions,
        'testField',
      );

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid option', () => {
      const result = coerceRatingAndSelectFieldOrThrow(
        'option1',
        validOptions,
        'testField',
      );

      expect(result).toBe('option1');
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() =>
        coerceRatingAndSelectFieldOrThrow(undefined, validOptions, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a string not in options', () => {
      expect(() =>
        coerceRatingAndSelectFieldOrThrow(
          'invalidOption',
          validOptions,
          'testField',
        ),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
