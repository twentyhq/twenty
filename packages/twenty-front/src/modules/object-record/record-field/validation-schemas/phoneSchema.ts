import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { z } from 'zod';

export const phoneSchema = z.string().refine((value) => {
  if (!value || value.trim() === '') return false;
  try {
    const phone = parsePhoneNumberWithError(value);
    return phone.isValid();
  } catch {
    return false;
  }
});
