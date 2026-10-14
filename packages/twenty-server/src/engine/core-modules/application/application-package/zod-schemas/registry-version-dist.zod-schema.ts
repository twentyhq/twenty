import { z } from 'zod';

export const registryVersionDistSchema = z.object({
  tarball: z.string().optional(),
  integrity: z.string().nullish(),
});
