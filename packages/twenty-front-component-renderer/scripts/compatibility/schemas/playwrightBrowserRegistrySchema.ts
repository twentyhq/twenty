import { z } from 'zod';

export const playwrightBrowserRegistrySchema = z.object({
  browsers: z
    .array(
      z.object({
        name: z.string().min(1),
        revision: z.string().min(1),
      }),
    )
    .min(1),
});
