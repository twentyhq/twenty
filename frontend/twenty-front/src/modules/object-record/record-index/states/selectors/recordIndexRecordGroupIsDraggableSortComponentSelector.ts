import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordGroupIsDraggableSortComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'recordIndexRecordGroupIsDraggableSortComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        return (
          get(recordIndexRecordGroupSortComponentState, { instanceId }) ===
          RecordGroupSort.Manual
        );
      },
  });
