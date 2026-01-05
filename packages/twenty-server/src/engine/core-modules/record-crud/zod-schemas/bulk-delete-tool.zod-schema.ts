import { z } from 'zod';

export const BulkDeleteToolInputSchema = z.object({
  filter: z
    .object({
      id: z
        .object({
          in: z
            .array(z.string().uuid())
            .describe('Array of record IDs to delete'),
        })
        .describe('Filter to select records to delete'),
    })
    .describe('Filter criteria to select records for bulk delete'),
});

export type BulkDeleteToolInput = z.infer<typeof BulkDeleteToolInputSchema>;
