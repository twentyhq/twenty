import { z } from 'zod';

const fileSchema = z.object({
  fileId: z.string(),
  label: z.string(),
  extension: z.string().optional(),
  url: z.string().optional(),
  fileCategory: z
    .enum([
      'ARCHIVE',
      'AUDIO',
      'IMAGE',
      'PRESENTATION',
      'SPREADSHEET',
      'TEXT_DOCUMENT',
      'VIDEO',
      'OTHER',
    ] as const)
    .optional(),
});

export const filesFieldValueSchema = z.array(fileSchema);
