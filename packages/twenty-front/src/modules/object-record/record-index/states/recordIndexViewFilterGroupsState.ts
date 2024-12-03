import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { createState } from 'twenty-ui';

export const recordIndexViewFilterGroupsState = createState<ViewFilterGroup[]>({
  key: 'recordIndexViewFilterGroupsState',
  defaultValue: [],
});
