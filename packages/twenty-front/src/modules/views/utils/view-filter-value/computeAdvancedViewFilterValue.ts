import { AdvancedFilterQuery } from '@/object-record/object-filter-dropdown/types/AdvancedFilterQuery';

export const computeAdvancedViewFilterValue = (
  advancedFilterQuery: AdvancedFilterQuery,
) => JSON.stringify(advancedFilterQuery);
