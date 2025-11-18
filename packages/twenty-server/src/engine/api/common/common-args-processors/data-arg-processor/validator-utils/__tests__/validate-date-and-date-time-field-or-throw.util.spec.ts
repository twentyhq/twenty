import { validateDateAndDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-date-and-date-time-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateDateAndDateTimeFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateDateAndDateTimeFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid ISO date string', () => {
      const dateString = '2024-01-15';
      const result = validateDateAndDateTimeFieldOrThrow(
        dateString,
        'testField',
      );

      expect(result).toBe(dateString);
    });

    it('should return the value when it is a valid ISO datetime string', () => {
      const datetimeString = '2024-01-15T10:30:00Z';
      const result = validateDateAndDateTimeFieldOrThrow(
        datetimeString,
        'testField',
      );

      expect(result).toBe(datetimeString);
    });

    it('should return the value when it is a Date object', () => {
      const dateObject = new Date('2024-01-15');
      const result = validateDateAndDateTimeFieldOrThrow(
        dateObject,
        'testField',
      );

      expect(result).toBe(dateObject);
    });

    it('should return the value when it is a timestamp number', () => {
      const timestamp = Date.now();
      const result = validateDateAndDateTimeFieldOrThrow(
        timestamp,
        'testField',
      );

      expect(result).toBe(timestamp);
    });

    it('should return the value when it is a Date', () => {
      const date = new Date();
      const result = validateDateAndDateTimeFieldOrThrow(date, 'testField');

      expect(result).toBe(date);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is an invalid date string', () => {
      expect(() =>
        validateDateAndDateTimeFieldOrThrow('invalid-date', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an empty string', () => {
      expect(() =>
        validateDateAndDateTimeFieldOrThrow('', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a boolean', () => {
      expect(() =>
        validateDateAndDateTimeFieldOrThrow(true, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an array', () => {
      expect(() =>
        validateDateAndDateTimeFieldOrThrow([], 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an object', () => {
      expect(() =>
        validateDateAndDateTimeFieldOrThrow({}, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() =>
        validateDateAndDateTimeFieldOrThrow(undefined, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
