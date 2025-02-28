import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { z } from 'zod';

const isValidJwtPattern = (val: string): boolean => {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(val);
};

export const PlaygroundSessionSchema = z.object({
  apiKey: z.string().refine((val) => isValidJwtPattern(val), {
    message: 'Invalid JWT token',
  }),
  schema: z.nativeEnum(PlaygroundSchemas),
});
