import { ViewFilter } from '@/views/types/ViewFilter';

export const resolveNumberViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value'>,
) => {
  return viewFilter.value === '' ? null : +viewFilter.value;
};
