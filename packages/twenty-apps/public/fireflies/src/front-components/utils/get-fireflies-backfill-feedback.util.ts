import { isUndefined } from '@sniptt/guards';

import { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';
import { type FirefliesBackfillFeedback } from 'src/front-components/types/fireflies-backfill-feedback.type';

const BACKFILL_FEEDBACK_BY_OUTCOME: Record<string, FirefliesBackfillFeedback> =
  {
    [FIREFLIES_BACKFILL_OUTCOME.STARTED]: {
      variant: 'success',
      message: 'Backfill started. Calls will appear as they are imported.',
    },
    [FIREFLIES_BACKFILL_OUTCOME.INVALID_REQUEST]: {
      variant: 'error',
      message: 'Enter a valid number of days.',
    },
    [FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED]: {
      variant: 'error',
      message: 'Set the Fireflies API key first.',
    },
  };

const UNKNOWN_OUTCOME_FEEDBACK: FirefliesBackfillFeedback = {
  variant: 'error',
  message: 'Could not start the backfill. Try again later.',
};

export const getFirefliesBackfillFeedback = (
  outcome: string | undefined,
): FirefliesBackfillFeedback => {
  if (isUndefined(outcome)) {
    return UNKNOWN_OUTCOME_FEEDBACK;
  }

  return BACKFILL_FEEDBACK_BY_OUTCOME[outcome] ?? UNKNOWN_OUTCOME_FEEDBACK;
};
