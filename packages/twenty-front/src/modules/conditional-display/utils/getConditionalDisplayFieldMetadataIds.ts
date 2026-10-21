import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalDisplay } from 'twenty-shared/types';

export const getConditionalDisplayFieldMetadataIds = (
  conditionalDisplay: ConditionalDisplay | null | undefined,
): string[] =>
  (conditionalDisplay?.recordFilters ?? [])
    .map((recordFilter) => recordFilter.fieldMetadataId)
    .filter(isNonEmptyString);
