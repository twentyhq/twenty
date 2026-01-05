import { z } from 'zod';

export const SoftDeleteToolInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe('The unique UUID of the record to soft delete'),
});

export type SoftDeleteToolInput = z.infer<typeof SoftDeleteToolInputSchema>;
