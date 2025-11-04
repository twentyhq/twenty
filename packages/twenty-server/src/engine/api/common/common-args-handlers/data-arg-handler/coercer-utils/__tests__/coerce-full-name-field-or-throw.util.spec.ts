import { coerceFullNameFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-full-name-field-or-throw.util';

describe('coerceFullNameFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceFullNameFieldOrThrow(null, 'fullName');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceFullNameFieldOrThrow({}, 'fullName');

      expect(result).toBeNull();
    });

    it('should return the full name when value has both firstName and lastName', () => {
      const fullName = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const result = coerceFullNameFieldOrThrow(fullName, 'fullName');

      expect(result).toEqual(fullName);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceFullNameFieldOrThrow(undefined, 'fullName')).toThrow(
        'Invalid value undefined for full name field "fullName"',
      );
    });

    it('should throw when value is a string', () => {
      expect(() => coerceFullNameFieldOrThrow('John Doe', 'fullName')).toThrow(
        'Invalid value \'John Doe\' for full name field "fullName"',
      );
    });

    it('should throw when value contains an invalid subfield name', () => {
      const fullName = {
        firstName: 'John',
        middleName: 'Robert',
      };

      expect(() => coerceFullNameFieldOrThrow(fullName, 'fullName')).toThrow(
        'Invalid value',
      );
      expect(() => coerceFullNameFieldOrThrow(fullName, 'fullName')).toThrow(
        'Invalid subfield middleName',
      );
    });

    it('should throw when firstName is an object', () => {
      const fullName = {
        firstName: { name: 'John' },
        lastName: 'Doe',
      };

      expect(() => coerceFullNameFieldOrThrow(fullName, 'fullName')).toThrow(
        'Invalid value',
      );
    });
  });
});
