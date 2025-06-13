import { ViewFilter } from '@/views/types/ViewFilter';
import { selectViewFilterValueSchema } from '@/views/view-filter-value/validation-schemas/selectViewFilterValueSchema';

export const resolveSelectViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value'>,
) => {
  return selectViewFilterValueSchema.parse(viewFilter.value);
};
