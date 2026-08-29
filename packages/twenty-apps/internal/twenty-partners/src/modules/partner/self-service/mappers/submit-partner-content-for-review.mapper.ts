import { z } from 'zod';

export const submitContentForReviewSchema = z.object({
  recordId: z.string(),
});

export type SubmitContentForReviewInput = z.infer<typeof submitContentForReviewSchema>;

// Only a WIP row can be submitted — this is the one status transition a partner
// can trigger themselves; every other transition stays staff-controlled.
export function canSubmitForReview(status: string | null): boolean {
  return status === 'WIP';
}
