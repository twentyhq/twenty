import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';
import { PlaygroundSessionSchema } from '@/settings/playground/utils/sessionSchema';
import { z } from 'zod';

export const setPlaygroundSession = (
  schema: PlaygroundSchemas,
  apiKey: z.infer<typeof PlaygroundSessionSchema.shape.apiKey>,
) => {
  const result = PlaygroundSessionSchema.safeParse({
    apiKey,
    schema,
  });

  if (!result.success) {
    throw new Error(`Invalid session data`);
  }

  PlaygroundSessionService.set(PlaygroundSessionKeys.SCHEMA, schema);
  PlaygroundSessionService.set(PlaygroundSessionKeys.API_KEY, apiKey);
};
