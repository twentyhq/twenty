import { FieldActorSource } from 'twenty-shared/types';

import { validateActorFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-actor-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateActorFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateActorFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return valid actor object with source and context', () => {
      const validActor = {
        source: FieldActorSource.EMAIL,
        context: { userId: '123', email: 'test@example.com' },
      };

      const result = validateActorFieldOrThrow(validActor, 'testField');

      expect(result).toEqual(validActor);
    });

    it('should accept empty context object', () => {
      const validActor = {
        source: FieldActorSource.EMAIL,
        context: {},
      };

      const result = validateActorFieldOrThrow(validActor, 'testField');

      expect(result).toEqual(validActor);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => validateActorFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a string', () => {
      expect(() => validateActorFieldOrThrow('invalid', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when source is invalid', () => {
      const invalidActor = {
        source: 'INVALID_SOURCE',
        context: {},
      };

      expect(() =>
        validateActorFieldOrThrow(invalidActor, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when context is a string', () => {
      const invalidActor = {
        source: FieldActorSource.EMAIL,
        context: 'invalid',
      };

      expect(() =>
        validateActorFieldOrThrow(invalidActor, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when actor has invalid subfield', () => {
      const invalidActor = {
        source: FieldActorSource.EMAIL,
        context: {},
        invalidField: 'invalid',
      };

      expect(() =>
        validateActorFieldOrThrow(invalidActor, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
