import { z } from 'zod';

export const ReadFileInputZodSchema = z.object({
  url: z
    .string()
    .describe(
      'The signed url of the file, exactly as returned in a files field or attachment of a record.',
    ),
  filename: z
    .string()
    .optional()
    .describe('The name of the file, with its extension.'),
});
