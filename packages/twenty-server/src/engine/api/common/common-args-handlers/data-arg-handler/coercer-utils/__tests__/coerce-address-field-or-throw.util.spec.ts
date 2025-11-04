import { coerceAddressFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-address-field-or-throw.util';

describe('coerceAddressFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceAddressFieldOrThrow(null, 'address');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceAddressFieldOrThrow({}, 'address');

      expect(result).toBeNull();
    });

    it('should return the address when value is a valid address with street fields', () => {
      const address = {
        addressStreet1: '123 Main St',
        addressStreet2: 'Apt 4B',
        addressCity: 'New York',
        addressState: 'NY',
        addressPostcode: '10001',
        addressCountry: 'USA',
        addressLat: 40.7128,
        addressLng: -74.006,
      };
      const result = coerceAddressFieldOrThrow(address, 'address');

      expect(result).toEqual(address);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceAddressFieldOrThrow(undefined, 'address')).toThrow(
        'Invalid value undefined for address field "address"',
      );
    });

    it('should throw when value is a string', () => {
      expect(() => coerceAddressFieldOrThrow('123 Main St', 'address')).toThrow(
        'Invalid value \'123 Main St\' for address field "address"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() =>
        coerceAddressFieldOrThrow(['123 Main St', 'New York'], 'address'),
      ).toThrow(
        "Invalid value [ '123 Main St', 'New York' ] for address field \"address\"",
      );
    });

    it('should throw when value contains an invalid subfield name', () => {
      const address = {
        addressStreet1: '123 Main St',
        invalidField: 'invalid',
      };

      expect(() => coerceAddressFieldOrThrow(address, 'address')).toThrow(
        "Invalid value { addressStreet1: '123 Main St', invalidField: 'invalid' } for address field \"address\"",
      );
    });

    it('should throw when addressLat is a string', () => {
      const address = {
        addressStreet1: '123 Main St',
        addressLat: '40.7128',
      };

      expect(() => coerceAddressFieldOrThrow(address, 'address')).toThrow(
        "Invalid value { addressStreet1: '123 Main St', addressLat: '40.7128' } for address field \"address\"",
      );
    });

    it('should throw when addressStreet1 is a number', () => {
      const address = {
        addressStreet1: 123,
      };

      expect(() => coerceAddressFieldOrThrow(address, 'address')).toThrow(
        'Invalid value { addressStreet1: 123 } for address field "address"',
      );
    });
  });
});
