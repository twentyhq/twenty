import { phonesFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldDefaultValueSchema';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';

describe('phonesFieldDefaultValueSchema', () => {
  it('should accept a fully populated default value', () => {
    const value = {
      primaryPhoneNumber: "'123456'",
      primaryPhoneCountryCode: "'FR'",
      primaryPhoneCallingCode: "'33'",
      additionalPhones: null,
    };

    expect(phonesFieldDefaultValueSchema.safeParse(value).success).toBe(true);
  });

  it('should accept a default value with null primary phone subfields', () => {
    const value = {
      primaryPhoneNumber: null,
      primaryPhoneCountryCode: "'FR'",
      primaryPhoneCallingCode: "'33'",
      additionalPhones: null,
    };

    expect(phonesFieldDefaultValueSchema.safeParse(value).success).toBe(true);
    expect(phonesFieldValueSchema.safeParse(value).success).toBe(false);
  });
});
