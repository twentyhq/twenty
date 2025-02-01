import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { createState } from "twenty-shared";

export const recordIndexViewFilterGroupsState = createState<ViewFilterGroup[]>({
  key: 'recordIndexViewFilterGroupsState',
  defaultValue: [],
});
