import { type ConditionalDisplay } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const hasConditionalDisplayRule = (
  conditionalDisplay: ConditionalDisplay | null | undefined,
): boolean => isNonEmptyArray(conditionalDisplay?.recordFilters);
