import { z } from 'zod';

const authorizeConnectionResultSchema = z.object({
  authorizationUrl: z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), {
      message: 'must be an http(s) URL',
    }),
});

type ParseAuthorizeConnectionResultOutcome =
  | { isValid: true; authorizationUrl: string }
  | { isValid: false; reason: string };

export const parseAuthorizeConnectionResult = (
  data: unknown,
): ParseAuthorizeConnectionResultOutcome => {
  const parsed = authorizeConnectionResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'result'}: ${issue.message}`)
        .join('; '),
    };
  }

  return { isValid: true, authorizationUrl: parsed.data.authorizationUrl };
};
