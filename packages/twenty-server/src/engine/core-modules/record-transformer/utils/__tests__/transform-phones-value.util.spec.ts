import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';

describe('transformPhonesValue', () => {
  it('should return undefined when value is undefined', () => {
    const result = transformPhonesValue({ input: undefined });

    expect(result).toBeUndefined();
  });

  it('should return null when value is null', () => {
    const result = transformPhonesValue({ input: null });

    expect(result).toBeNull();
  });

  it('should transform primaryPhoneNumber and infer codes if missing', () => {
    const value = {
      primaryPhoneNumber: '+33612345678',
    };

    const result = transformPhonesValue({ input: value });

    expect(result).toEqual({
      primaryPhoneNumber: '612345678',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'FR',
      additionalPhones: null,
    });
  });

  it('should transform primaryPhoneNumber and infer codes if they are empty strings', () => {
    const value = {
      primaryPhoneNumber: '+33612345678',
      primaryPhoneCallingCode: '',
      primaryPhoneCountryCode: '',
    };

    const result = transformPhonesValue({ input: value });

    expect(result).toEqual({
      primaryPhoneNumber: '612345678',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'FR',
      additionalPhones: null,
    });
  });

  it('should preserve provided matching codes', () => {
    const value = {
      primaryPhoneNumber: '612345678',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'FR',
    };

    const result = transformPhonesValue({ input: value });

    expect(result).toEqual({
      primaryPhoneNumber: '612345678',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'FR',
      additionalPhones: null,
    });
  });

  it('should throw error if provided country code is conflicting', () => {
    const value = {
      primaryPhoneNumber: '612345678',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'US',
    };

    expect(() => transformPhonesValue({ input: value })).toThrow(
      'Provided country code and calling code are conflicting',
    );
  });

  it('should transform additionalPhones array', () => {
    const value = {
      primaryPhoneNumber: '+33612345678',
      additionalPhones: JSON.stringify([
        {
          number: '+12025550123',
          callingCode: '',
          countryCode: '',
        },
      ]),
    };

    const result = transformPhonesValue({ input: value })!;

    expect(result.primaryPhoneNumber).toBe('612345678');
    expect(result.primaryPhoneCallingCode).toBe('+33');
    expect(result.primaryPhoneCountryCode).toBe('FR');

    const additional = JSON.parse(result.additionalPhones as string);
    expect(additional).toHaveLength(1);
    expect(additional[0]).toEqual({
      number: '2025550123',
      callingCode: '+1',
      countryCode: 'US',
    });
  });

  it('should transform additionalPhones JSON string', () => {
    const value = {
      primaryPhoneNumber: '+33612345678',
      additionalPhones: JSON.stringify([
        {
          number: '2025550123',
          callingCode: '+1',
          countryCode: 'US',
        },
      ]),
    };

    const result = transformPhonesValue({ input: value })!;

    const additional = JSON.parse(result.additionalPhones as string);
    expect(additional).toHaveLength(1);
    expect(additional[0]).toEqual({
      number: '2025550123',
      callingCode: '+1',
      countryCode: 'US',
    });
  });

  it('should handle invalid phone number', () => {
    const value = {
      primaryPhoneNumber: 'invalid',
    };

    expect(() => transformPhonesValue({ input: value })).toThrow(
      'Provided phone number is invalid invalid',
    );
  });
});
