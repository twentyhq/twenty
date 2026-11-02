import { z } from 'zod';

import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';

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
      reason: formatLogicFunctionResultIssues(parsed.error),
    };
  }

  return { isValid: true, authorizationUrl: parsed.data.authorizationUrl };
};
