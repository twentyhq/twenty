import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

export const CreateFileUploadToolInputZodSchema = z.object({
  filename: z
    .string()
    .describe(
      'Original filename including extension (e.g. protokol-2026-001.pdf).',
    ),
  size: z
    .number()
    .int()
    .positive()
    .describe('Exact byte length of the file being uploaded.'),
});

export const CompleteFileUploadToolInputZodSchema = z.object({
  fileId: z
    .string()
    .refine((fileId) => isValidUuid(fileId))
    .describe(
      'fileId returned by create_file_upload after the bytes have been PUT to uploadUrl.',
    ),
});
