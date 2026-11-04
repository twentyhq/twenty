import { phoneSchema } from '@/object-record/record-field/ui/validation-schemas/phoneSchema';

export const validatePhoneInput = (input: string) => ({
  isValid: phoneSchema.safeParse(input).success,
  errorMessage: '',
});
