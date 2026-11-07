import { type z } from 'zod';

export const formatLogicFunctionResultIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `${issue.path.join('.') || 'result'}: ${issue.message}`)
    .join('; ');
