import { z } from 'zod';

export const SearchOutputInputZodSchema = z.object({
  fileId: z
    .string()
    .describe(
      'ID of the spilled output file to search (the outputRef.fileId returned when a tool result was too large to inline).',
    ),
  pattern: z
    .string()
    .min(1)
    .describe(
      'Text or regular expression to search for. Treated as a regular expression when valid, otherwise as a literal string. Matched against the raw file text.',
    ),
  maxMatches: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Maximum number of occurrences to return (default 10).'),
  offset: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'Number of occurrences to skip before returning results, for stateless pagination (default 0).',
    ),
  contextChars: z
    .number()
    .int()
    .nonnegative()
    .max(2000)
    .optional()
    .describe(
      'Number of characters of context to include before and after each occurrence (default 100).',
    ),
});
