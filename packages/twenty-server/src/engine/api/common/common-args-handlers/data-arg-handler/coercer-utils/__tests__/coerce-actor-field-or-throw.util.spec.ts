import { coerceActorFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-actor-field-or-throw.util';

describe('coerceActorFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceActorFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceActorFieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return the actor when value has valid source and context fields', () => {
      const actor = {
        source: 'WORKFLOW',
        context: { provider: 'google' },
      };
      const result = coerceActorFieldOrThrow(actor, 'testField');

      expect(result).toEqual(actor);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceActorFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid value undefined for actor field "testField"',
      );
    });

    it('should throw when value is a string', () => {
      expect(() => coerceActorFieldOrThrow('EMAIL', 'testField')).toThrow(
        'Invalid value \'EMAIL\' for actor field "testField"',
      );
    });

    it('should throw when value contains an invalid subfield name', () => {
      const actor = {
        source: 'EMAIL',
        invalidField: 'invalid',
      };

      expect(() => coerceActorFieldOrThrow(actor, 'testField')).toThrow(
        'Invalid value',
      );
      expect(() => coerceActorFieldOrThrow(actor, 'testField')).toThrow(
        'Invalid subfield invalidField',
      );
    });
  });
});
