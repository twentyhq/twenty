import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';

export const tableViewFilterGroupsComponentState = createComponentStateV2<
  ViewFilterGroup[]
>({
  key: 'tableViewFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
