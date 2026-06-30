import { validateUUIDFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-uuid-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateUUIDFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateUUIDFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = validateUUIDFieldOrThrow(validUuid, 'testField');

      expect(result).toBe(validUuid);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => validateUUIDFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an empty string', () => {
      expect(() => validateUUIDFieldOrThrow('', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an invalid UUID format', () => {
      expect(() =>
        validateUUIDFieldOrThrow('invalid-uuid', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
