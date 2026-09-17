import { BACKFILL_STARTED_OUTCOME } from 'src/constants/backfill';
import { type BackfillFeedback } from 'src/front-components/types/backfill-feedback.type';

const STARTED_FEEDBACK: BackfillFeedback = {
  variant: 'success',
  message: 'Backfill started. Fields will fill in as records are processed.',
};

const UNKNOWN_OUTCOME_FEEDBACK: BackfillFeedback = {
  variant: 'error',
  message: 'Could not start the backfill. Try again later.',
};

export const getBackfillFeedback = (
  outcome: string | undefined,
): BackfillFeedback =>
  outcome === BACKFILL_STARTED_OUTCOME
    ? STARTED_FEEDBACK
    : UNKNOWN_OUTCOME_FEEDBACK;
