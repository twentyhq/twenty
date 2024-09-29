import { ViewFilter } from '@/views/types/ViewFilter';
import { ImmutableTree, Utils } from '@react-awesome-query-builder/ui';

export const resolveAdvancedViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value'>,
): ImmutableTree | null => {
  if (!viewFilter.value) return null;

  return Utils.loadTree(JSON.parse(viewFilter.value));
};
