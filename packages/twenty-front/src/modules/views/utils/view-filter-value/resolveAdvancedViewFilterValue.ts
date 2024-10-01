import { AdvancedFilterQuery } from '@/object-record/object-filter-dropdown/types/AdvancedFilterQuery';
import { ViewFilter } from '@/views/types/ViewFilter';

export const resolveAdvancedViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value'>,
): AdvancedFilterQuery | null => {
  if (!viewFilter.value) return null;

  return JSON.parse(viewFilter.value);
};
