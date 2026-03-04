import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordGroupSortComponentState =
  createAtomComponentState<RecordGroupSort>({
    key: 'recordIndexRecordGroupSortComponentState',
    defaultValue: RecordGroupSort.Manual,
    componentInstanceContext: ViewComponentInstanceContext,
  });
