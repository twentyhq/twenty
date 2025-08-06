import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordGroupIsDraggableSortComponentSelector =
  createComponentSelector<boolean>({
    key: 'recordIndexRecordGroupIsDraggableSortComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        return (
          get(
            recordIndexRecordGroupSortComponentState.atomFamily({
              instanceId,
            }),
          ) === RecordGroupSort.Manual
        );
      },
  });
