import { z } from 'zod';

export const playwrightPackageSchema = z.object({
  version: z.string().min(1),
});
