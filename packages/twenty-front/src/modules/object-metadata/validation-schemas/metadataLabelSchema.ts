import { z } from 'zod';

export const metadataLabelSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9 ]*$/);
