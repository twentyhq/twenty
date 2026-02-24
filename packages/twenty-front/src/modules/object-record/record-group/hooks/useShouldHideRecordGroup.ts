import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentFamilyValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyValue';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useShouldHideRecordGroup = (recordGroupId: string): boolean => {
  const shouldHideEmptyRecordGroups = useAtomComponentValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const isRecordGroupEmpty = useAtomComponentFamilyValue(
    emptyRecordGroupByIdComponentFamilyState,
    recordGroupId,
  );

  return shouldHideEmptyRecordGroups && isRecordGroupEmpty;
};
