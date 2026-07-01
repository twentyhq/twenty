import { emailSchema } from '@/object-record/record-field/ui/validation-schemas/emailSchema';

describe('emailSchema', () => {
  it('should reject email values longer than 320 characters', () => {
    const localPart = 'a'.repeat(310);
    const invalidEmail = `${localPart}@b.com`;

    expect(emailSchema.safeParse(invalidEmail).success).toBe(false);
  });

  it('should validate a regular email value', () => {
    expect(emailSchema.safeParse('test@acme.com').success).toBe(true);
  });
});
