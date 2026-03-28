import { transformPhonesValue } from '../transform-phones-value.util';

describe('transformPhonesValue', () => {
  it('should infer calling code and country code from E.164 number when they are empty strings', () => {
    const result = transformPhonesValue({
      input: {
        primaryPhoneNumber: '+919999999999',
        primaryPhoneCallingCode: '',
        primaryPhoneCountryCode: '',
      },
    });

    expect(result).toEqual({
      primaryPhoneNumber: '9999999999',
      primaryPhoneCallingCode: '+91',
      primaryPhoneCountryCode: 'IN',
      additionalPhones: null,
    });
  });

  it('should infer calling code and country code from E.164 number when they are not provided', () => {
    const result = transformPhonesValue({
      input: {
        primaryPhoneNumber: '+14155552671',
      },
    });

    expect(result).toEqual({
      primaryPhoneNumber: '4155552671',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: null,
    });
  });

  it('should preserve explicitly provided calling code and country code', () => {
    const result = transformPhonesValue({
      input: {
        primaryPhoneNumber: '9999999999',
        primaryPhoneCallingCode: '+91',
        primaryPhoneCountryCode: 'IN',
      },
    });

    expect(result).toEqual({
      primaryPhoneNumber: '9999999999',
      primaryPhoneCallingCode: '+91',
      primaryPhoneCountryCode: 'IN',
      additionalPhones: null,
    });
  });

  it('should return input as-is when input is null', () => {
    const result = transformPhonesValue({ input: null });
    expect(result).toBeNull();
  });

  it('should return input as-is when input is undefined', () => {
    const result = transformPhonesValue({ input: undefined });
    expect(result).toBeUndefined();
  });

  it('should handle empty phone number with empty calling code', () => {
    const result = transformPhonesValue({
      input: {
        primaryPhoneNumber: '',
        primaryPhoneCallingCode: '',
        primaryPhoneCountryCode: '',
      },
    });

    expect(result).toEqual({
      additionalPhones: null,
    });
  });
});
