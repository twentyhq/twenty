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

export const CodeInterpreterToolParametersZodSchema = z.object({
  loadingMessage: z
    .string()
    .describe(
      "A clear, human-readable status message describing the code being executed. This will be shown to the user while the tool is running, so phrase it as a present-tense status update (e.g., 'Creating a bar chart from sales data'). Explain what analysis or visualization you are performing in natural language.",
    ),
  input: CodeInterpreterInputZodSchema,
});
