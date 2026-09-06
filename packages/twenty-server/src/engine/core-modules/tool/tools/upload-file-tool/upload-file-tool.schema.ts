import { z } from 'zod';

import { settings } from 'src/engine/constants/settings';

export const UploadFileToolInputZodSchema = z.object({
  filename: z
    .string()
    .describe(
      'Filename with extension (e.g. protokol-2026-001.pdf). Use this same string as label when attaching the file to a record.',
    ),
  content: z
    .string()
    .describe(
      `File bytes as base64, or a data URL (data:<mime>;base64,...). Maximum size ${settings.storage.maxFileSize}.`,
    ),
});
