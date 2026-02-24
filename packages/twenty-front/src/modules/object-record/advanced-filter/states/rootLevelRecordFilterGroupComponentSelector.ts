import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const rootLevelRecordFilterGroupComponentSelector =
  createComponentSelectorV2<RecordFilterGroup | undefined>({
    key: 'rootLevelRecordFilterGroupComponentSelector',
    componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const currentRecordFilterGroups = get(
          currentRecordFilterGroupsComponentState,
          componentStateKey,
        ) as RecordFilterGroup[];

        const rootLevelRecordFilterGroup = currentRecordFilterGroups.find(
          (recordFilterGroup) =>
            !isDefined(recordFilterGroup.parentRecordFilterGroupId),
        );

        return rootLevelRecordFilterGroup;
      },
  });
