import { z } from 'zod';

export const SearchOutputInputZodSchema = z.object({
  fileId: z
    .string()
    .describe(
      'ID of the spilled output file to search (the outputRef.fileId returned when a tool result was too large to inline).',
    ),
  pattern: z
    .string()
    .describe(
      'Text or regular expression to search for. Matched line by line against the indented JSON representation of the file.',
    ),
  maxMatches: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Maximum number of matches to return (default 10).'),
  offset: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'Number of matches to skip before returning results, for stateless pagination (default 0).',
    ),
  contextLines: z
    .number()
    .int()
    .nonnegative()
    .max(10)
    .optional()
    .describe(
      'Lines of context to include before and after each match (default 2).',
    ),
});
