import { z } from 'zod';

export const storybookIndexSchema = z.object({
  entries: z.record(z.string(), z.unknown()),
});
