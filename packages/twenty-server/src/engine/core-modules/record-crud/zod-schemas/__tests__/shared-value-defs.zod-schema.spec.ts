import { PhonesValueSchema } from 'src/engine/core-modules/record-crud/zod-schemas/shared-value-defs.zod-schema';

describe('PhonesValueSchema', () => {
  // Regression: additionalPhones used to be typed as string[], so the AI
  // create/update tools would emit plain strings (e.g. "+33612345678") that
  // the phones transformer then destructured as { number, callingCode,
  // countryCode }, silently dropping the number.
  it('accepts additionalPhones as an array of phone objects', () => {
    const result = PhonesValueSchema.safeParse({
      primaryPhoneNumber: '612345678',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        { number: '987654321', countryCode: 'GB', callingCode: '+44' },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects additionalPhones as an array of plain strings', () => {
    const result = PhonesValueSchema.safeParse({
      additionalPhones: ['+33612345678'],
    });

    expect(result.success).toBe(false);
  });
});
