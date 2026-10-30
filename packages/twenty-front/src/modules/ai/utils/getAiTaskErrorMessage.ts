import { t } from '@lingui/core/macro';
import { type SetuAiErrorCode } from 'twenty-shared/ai';

// Copy for task and step failures. None of it names records the person may
// not see.
export const getAiTaskErrorMessage = (
  errorCode: SetuAiErrorCode | null | undefined,
): string => {
  switch (errorCode) {
    case 'INVALID_INPUT':
      return t`Some details are not valid. Check the answer and try again.`;
    case 'STALE_VERSION':
      return t`This task changed since you opened it. The latest state is shown.`;
    case 'NOT_REVIEWABLE':
      return t`This part of the task can no longer be changed.`;
    case 'BUDGET_EXHAUSTED':
      return t`The AI budget for this task is used up. Finished briefs are kept.`;
    case 'MODEL_UNAVAILABLE':
      return t`No OpenAI model is available for research.`;
    case 'TIMED_OUT':
      return t`The research took too long and was stopped.`;
    case 'RESEARCH_FAILED':
      return t`The research could not be completed.`;
    case 'NOT_AVAILABLE':
      return t`This account is no longer available to you.`;
    default:
      return t`Something went wrong. Try again.`;
  }
};
