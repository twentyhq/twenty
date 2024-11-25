import { ViewFilter } from '@/views/types/ViewFilter';

export const resolveBooleanViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value'>,
) => {
  return viewFilter.value === 'true';
};
