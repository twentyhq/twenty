import { z } from 'zod';

export const TRACKED_JOB_PROGRESS_SCHEMA = z.object({
  processedCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
});
