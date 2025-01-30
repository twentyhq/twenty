import { ConnectedAccountProvider } from 'twenty-shared';

import { z } from 'zod';

import { FieldActorValue } from '../FieldMetadata';

const actorSchema = z.object({
  source: z.string(),
  workspaceMemberId: z.optional(z.string().nullable()),
  name: z.string(),
  context: z.optional(
    z.object({
      provider: z.optional(z.nativeEnum(ConnectedAccountProvider)),
    }),
  ),
});

export const isFieldActorValue = (
  fieldValue: unknown,
): fieldValue is FieldActorValue => actorSchema.safeParse(fieldValue).success;
