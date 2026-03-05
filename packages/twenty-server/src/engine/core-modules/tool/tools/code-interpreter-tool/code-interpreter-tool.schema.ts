import { z } from 'zod';

export const CodeInterpreterInputZodSchema = z.object({
  code: z.string().describe('Python code to execute'),
  files: z
    .array(
      z.object({
        filename: z.string().describe('Name of the file'),
        fileId: z
          .string()
          .describe('ID of the uploaded file (from user attachments)'),
      }),
    )
    .optional()
    .describe('Files to make available in the execution environment'),
});
