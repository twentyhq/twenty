import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordGroupSortComponentState =
  createComponentStateV2<RecordGroupSort>({
    key: 'recordIndexRecordGroupSortComponentState',
    defaultValue: RecordGroupSort.Manual,
    componentInstanceContext: ViewComponentInstanceContext,
  });
