import { validateDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-date-time-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateDateTimeFieldOrThrow', () => {
  describe('valid inputs (normalized to a canonical instant)', () => {
    it('should return null when value is null', () => {
      const result = validateDateTimeFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should keep the instant for an ISO datetime string with Z timezone', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15T10:30:00Z',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should drop a zero millisecond fraction', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15T10:30:00.000Z',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should convert a timezone offset to its UTC instant', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15T10:30:00+02:00',
        'testField',
      );

      expect(result).toBe('2024-01-15T08:30:00Z');
    });

    it('should convert a timezone offset with milliseconds to its UTC instant', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15T10:30:00.000+02:00',
        'testField',
      );

      expect(result).toBe('2024-01-15T08:30:00Z');
    });

    it('should interpret a zoneless ISO datetime as UTC', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15T10:30:00',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should interpret a zoneless ISO datetime with milliseconds as UTC', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15T10:30:00.000',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should normalize a datetime with a space separator', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15 10:30:00',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should normalize a datetime with a space separator and milliseconds', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15 10:30:00.000',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should normalize a datetime with a space separator without seconds', () => {
      const result = validateDateTimeFieldOrThrow(
        '2024-01-15 10:30',
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });

    it('should normalize a date-only value to midnight UTC', () => {
      const result = validateDateTimeFieldOrThrow('2024-01-15', 'testField');

      expect(result).toBe('2024-01-15T00:00:00Z');
    });

    it('should normalize a compact date-only value to midnight UTC', () => {
      const result = validateDateTimeFieldOrThrow('20240115', 'testField');

      expect(result).toBe('2024-01-15T00:00:00Z');
    });

    it('should normalize a date with a full month name to midnight UTC', () => {
      const result = validateDateTimeFieldOrThrow(
        'January 15, 2024',
        'testField',
      );

      expect(result).toBe('2024-01-15T00:00:00Z');
    });

    it('should normalize a Date object to its instant', () => {
      const result = validateDateTimeFieldOrThrow(
        new Date('2024-01-15T10:30:00Z'),
        'testField',
      );

      expect(result).toBe('2024-01-15T10:30:00Z');
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is just a year', () => {
      expect(() => validateDateTimeFieldOrThrow('2024', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is year and month only', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('2024-01', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an invalid datetime string', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('invalid-datetime', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an empty string', () => {
      expect(() => validateDateTimeFieldOrThrow('', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a boolean', () => {
      expect(() => validateDateTimeFieldOrThrow(true, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an array', () => {
      expect(() => validateDateTimeFieldOrThrow([], 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an object', () => {
      expect(() => validateDateTimeFieldOrThrow({}, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is undefined', () => {
      expect(() =>
        validateDateTimeFieldOrThrow(undefined, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a number (timestamp)', () => {
      expect(() =>
        validateDateTimeFieldOrThrow(1234567890, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a random string', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('hello world', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a datetime with invalid month', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('2024-13-01T10:30:00Z', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a datetime with invalid day', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('2024-02-31T10:30:00Z', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a datetime with invalid hour', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('2024-01-15T25:30:00Z', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a datetime with invalid minute', () => {
      expect(() =>
        validateDateTimeFieldOrThrow('2024-01-15T10:60:00Z', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
