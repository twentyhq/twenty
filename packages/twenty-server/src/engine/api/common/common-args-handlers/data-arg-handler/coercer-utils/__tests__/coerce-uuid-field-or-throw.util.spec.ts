import { coerceUUIDFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-uuid-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

describe('coerceUUIDFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceUUIDFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = coerceUUIDFieldOrThrow(validUuid, 'testField');

      expect(result).toBe(validUuid);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceUUIDFieldOrThrow(undefined, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is an empty string', () => {
      expect(() => coerceUUIDFieldOrThrow('', 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is an invalid UUID format', () => {
      expect(() => coerceUUIDFieldOrThrow('invalid-uuid', 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });
  });
});
