import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const objectOptionsDropdownRecordGroupSortComponentState =
  createComponentStateV2<RecordGroupSort>({
    key: 'objectOptionsDropdownRecordGroupSortComponentState',
    defaultValue: RecordGroupSort.Manual,
    componentInstanceContext: ViewComponentInstanceContext,
  });
