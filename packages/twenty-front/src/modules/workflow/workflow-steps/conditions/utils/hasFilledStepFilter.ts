import { isNonEmptyString } from '@sniptt/guards';
import { type StepFilter } from 'twenty-shared/types';

// A row without a field is a draft the user has not filled in, not a condition
export const hasFilledStepFilter = (
  stepFilters: Pick<StepFilter, 'stepOutputKey'>[],
) =>
  stepFilters.some((stepFilter) => isNonEmptyString(stepFilter.stepOutputKey));
