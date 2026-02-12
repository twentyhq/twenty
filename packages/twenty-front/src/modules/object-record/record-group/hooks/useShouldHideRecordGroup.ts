import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useShouldHideRecordGroup = (recordGroupId: string): boolean => {
  const shouldHideEmptyRecordGroups = useRecoilComponentValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const isRecordGroupEmpty = useRecoilComponentFamilyValue(
    emptyRecordGroupByIdComponentFamilyState,
    recordGroupId,
  );

  return shouldHideEmptyRecordGroups && isRecordGroupEmpty;
};
