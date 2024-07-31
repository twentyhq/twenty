import { z } from 'zod';

import { FieldCreatedByValue } from '../FieldMetadata';

const createdBySchema = z.object({
  source: z.string(),
  workspaceMemberId: z.optional(z.string().nullable()),
  name: z.string(),
});

export const isFieldCreatedByValue = (
  fieldValue: unknown,
): fieldValue is FieldCreatedByValue =>
  createdBySchema.safeParse(fieldValue).success;
