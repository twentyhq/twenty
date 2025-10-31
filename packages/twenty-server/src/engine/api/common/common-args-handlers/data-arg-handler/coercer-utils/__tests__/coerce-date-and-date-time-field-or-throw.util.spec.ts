import { coerceDateAndDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-date-and-date-time-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

describe('coerceDateAndDateTimeFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceDateAndDateTimeFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid ISO date string', () => {
      const dateString = '2024-01-15';
      const result = coerceDateAndDateTimeFieldOrThrow(dateString, 'testField');

      expect(result).toBe(dateString);
    });

    it('should return the value when it is a valid ISO datetime string', () => {
      const datetimeString = '2024-01-15T10:30:00Z';
      const result = coerceDateAndDateTimeFieldOrThrow(
        datetimeString,
        'testField',
      );

      expect(result).toBe(datetimeString);
    });

    it('should return the value when it is a Date object', () => {
      const dateObject = new Date('2024-01-15');
      const result = coerceDateAndDateTimeFieldOrThrow(dateObject, 'testField');

      expect(result).toBe(dateObject);
    });

    it('should return the value when it is a timestamp number', () => {
      const timestamp = Date.now();
      const result = coerceDateAndDateTimeFieldOrThrow(timestamp, 'testField');

      expect(result).toBe(timestamp);
    });

    it('should return the value when it is a Date', () => {
      const date = new Date();
      const result = coerceDateAndDateTimeFieldOrThrow(date, 'testField');

      expect(result).toBe(date);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is an invalid date string', () => {
      expect(() =>
        coerceDateAndDateTimeFieldOrThrow('invalid-date', 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is an empty string', () => {
      expect(() => coerceDateAndDateTimeFieldOrThrow('', 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a boolean', () => {
      expect(() =>
        coerceDateAndDateTimeFieldOrThrow(true, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is an array', () => {
      expect(() => coerceDateAndDateTimeFieldOrThrow([], 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is an object', () => {
      expect(() => coerceDateAndDateTimeFieldOrThrow({}, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is undefined', () => {
      expect(() =>
        coerceDateAndDateTimeFieldOrThrow(undefined, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
