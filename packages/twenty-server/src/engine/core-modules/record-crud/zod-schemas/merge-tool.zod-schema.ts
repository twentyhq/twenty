import { MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';
import { z } from 'zod';

export const MergeToolInputSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(2)
    .max(MUTATION_MAX_MERGE_RECORDS)
    .describe('List of record IDs to merge'),
  conflictPriorityIndex: z
    .number()
    .int()
    .min(0)
    .describe('Index of the record in ids that takes precedence on conflict'),
  dryRun: z
    .boolean()
    .optional()
    .default(false)
    .describe('Simulate the merge without persisting changes'),
});

export type MergeToolInput = z.infer<typeof MergeToolInputSchema>;
