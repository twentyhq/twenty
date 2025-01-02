import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { createState } from '@ui/utilities/state/utils/createState';

export const recordIndexViewFilterGroupsState = createState<ViewFilterGroup[]>({
  key: 'recordIndexViewFilterGroupsState',
  defaultValue: [],
});
