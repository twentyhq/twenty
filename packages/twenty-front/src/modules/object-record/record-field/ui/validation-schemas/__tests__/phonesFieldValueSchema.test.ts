import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';

describe('phonesFieldValueSchema', () => {
  it('should accept a well-formed value', () => {
    const result = phonesFieldValueSchema.safeParse({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('should complete an additional phone whose country code is null', () => {
    const result = phonesFieldValueSchema.safeParse({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [{ number: '555000111', countryCode: null }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.additionalPhones).toEqual([
      { number: '555000111', callingCode: '', countryCode: '' },
    ]);
  });

  it('should complete an additional phone whose calling code is missing', () => {
    const result = phonesFieldValueSchema.safeParse({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      additionalPhones: [{ number: '555000222', countryCode: 'GB' }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.additionalPhones).toEqual([
      { number: '555000222', callingCode: '', countryCode: 'GB' },
    ]);
  });

  it('should still reject an additional phone without a number', () => {
    const result = phonesFieldValueSchema.safeParse({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      additionalPhones: [{ callingCode: '+44', countryCode: 'GB' }],
    });

    expect(result.success).toBe(false);
  });

  it('should still reject a missing primary phone number', () => {
    const result = phonesFieldValueSchema.safeParse({
      primaryPhoneCountryCode: 'US',
      additionalPhones: [],
    });

    expect(result.success).toBe(false);
  });
});
