import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const rootLevelRecordFilterGroupComponentSelector =
  createComponentSelectorV2({
    key: 'rootLevelRecordFilterGroupComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentRecordFilterGroups = get(
          currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
        );

        const rootLevelRecordFilterGroup = currentRecordFilterGroups.find(
          (recordFilterGroup) =>
            !isDefined(recordFilterGroup.parentRecordFilterGroupId),
        );

        return rootLevelRecordFilterGroup;
      },
    componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
  });
