import { z } from 'zod';

export const ExtractJsonPathInputZodSchema = z.object({
  fileId: z
    .string()
    .describe(
      'ID of the spilled output file to read (the outputRef.fileId returned when a tool result was too large to inline).',
    ),
  path: z
    .string()
    .regex(/^\$/, 'Path must start with "$"')
    .describe(
      'JSONPath-lite expression, e.g. $.failedStepLogs["step-id"].entries[0:5]. Supports dot notation, bracket keys, array index, slicing [start:end] and a single-level wildcard [*]. Filters and recursive descent are not supported (use code_interpreter for those).',
    ),
  maxItems: z
    .number()
    .int()
    .positive()
    .max(200)
    .optional()
    .describe('Maximum array items to return per array (default 20).'),
  maxDepth: z
    .number()
    .int()
    .positive()
    .max(10)
    .optional()
    .describe(
      'Maximum nesting depth before deeper structures are replaced with type markers (default 5).',
    ),
});
