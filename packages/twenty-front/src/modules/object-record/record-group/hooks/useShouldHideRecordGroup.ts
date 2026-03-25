import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useShouldHideRecordGroup = (recordGroupId: string): boolean => {
  const recordIndexShouldHideEmptyRecordGroups = useAtomComponentStateValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const emptyRecordGroupById = useAtomComponentFamilyStateValue(
    emptyRecordGroupByIdComponentFamilyState,
    recordGroupId,
  );

  return recordIndexShouldHideEmptyRecordGroups && emptyRecordGroupById;
};
