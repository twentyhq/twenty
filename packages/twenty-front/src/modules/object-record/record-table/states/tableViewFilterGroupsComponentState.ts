import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';

export const tableViewFilterGroupsComponentState = createComponentState<
  ViewFilterGroup[]
>({
  key: 'tableViewFilterGroupsComponentState',
  defaultValue: [],
});
