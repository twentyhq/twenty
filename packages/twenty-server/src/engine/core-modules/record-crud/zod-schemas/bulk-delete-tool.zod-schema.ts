import { z } from 'zod';

export const BulkDeleteToolInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe(
      'A clear, human-readable description of the action being performed. Explain what operation you are executing and with what parameters in natural language.',
    ),
  input: z.object({
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
  }),
});

export type BulkDeleteToolInput = z.infer<typeof BulkDeleteToolInputSchema>;
