import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordGroupSortComponentState =
  createComponentState<RecordGroupSort>({
    key: 'recordIndexRecordGroupSortComponentState',
    defaultValue: RecordGroupSort.Manual,
    componentInstanceContext: ViewComponentInstanceContext,
  });
