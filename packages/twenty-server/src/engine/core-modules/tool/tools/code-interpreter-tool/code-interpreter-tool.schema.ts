import { z } from 'zod';

export const CodeInterpreterInputZodSchema = z.object({
  code: z.string().describe('Python code to execute'),
  files: z
    .array(
      z.object({
        filename: z.string().describe('Name of the file'),
        url: z
          .string()
          .describe('URL of the file to include (from user attachments)'),
      }),
    )
    .optional()
    .describe('Files to make available in the execution environment'),
});
