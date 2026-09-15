import { z } from 'zod';

// Partner-controlled URLs are echoed into public marketplace profiles and rendered as
// links, so block non-web protocols (javascript:, data:) that would execute in a
// visitor's origin. Only http/https are allowed.
export const isHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// A blank value means "clear the field"; anything else must be a valid http/https URL.
export const optionalHttpUrl = z.preprocess(
  (value) => (value === '' ? null : value),
  z
    .string()
    .refine(isHttpUrl, { message: 'URL must use http or https' })
    .nullable()
    .optional(),
);
