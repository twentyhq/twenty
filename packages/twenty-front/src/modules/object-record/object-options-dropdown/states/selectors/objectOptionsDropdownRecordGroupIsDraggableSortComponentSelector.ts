import { objectOptionsDropdownRecordGroupSortComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownRecordGroupSortComponentState';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const objectOptionsDropdownRecordGroupIsDraggableSortComponentSelector =
  createComponentSelectorV2({
    key: 'objectOptionsDropdownRecordGroupIsDraggableSortComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        return (
          get(
            objectOptionsDropdownRecordGroupSortComponentState.atomFamily({
              instanceId,
            }),
          ) === RecordGroupSort.MANUAL
        );
      },
  });
