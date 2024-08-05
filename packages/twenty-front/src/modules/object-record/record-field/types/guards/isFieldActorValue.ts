import { z } from 'zod';

import { FieldActorValue } from '../FieldMetadata';

const actorSchema = z.object({
  source: z.string(),
  workspaceMemberId: z.optional(z.string().nullable()),
  name: z.string(),
});

export const isFieldActorValue = (
  fieldValue: unknown,
): fieldValue is FieldActorValue => actorSchema.safeParse(fieldValue).success;
