import { ViewFilter } from '@/views/types/ViewFilter';

export const resolveRelationViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value'>,
) => {
  // TODO: convert 'CURRENT_USER' to the current user id
  return viewFilter.value;
};
