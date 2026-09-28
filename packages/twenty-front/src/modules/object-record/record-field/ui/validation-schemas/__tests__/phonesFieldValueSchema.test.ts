import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';

describe('phonesFieldValueSchema', () => {
  it('should accept null primary phone subfields', () => {
    const value = {
      primaryPhoneNumber: null,
      primaryPhoneCountryCode: null,
      primaryPhoneCallingCode: null,
      additionalPhones: null,
    };

    expect(phonesFieldValueSchema.safeParse(value).success).toBe(true);
  });

  it('should accept null subfields on an additional phone', () => {
    const value = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        { number: '987654321', callingCode: null, countryCode: null },
      ],
    };

    expect(phonesFieldValueSchema.safeParse(value).success).toBe(true);
  });
});
