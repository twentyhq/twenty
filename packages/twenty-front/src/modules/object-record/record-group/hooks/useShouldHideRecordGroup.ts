import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useShouldHideRecordGroup = (recordGroupId: string): boolean => {
  const shouldHideEmptyRecordGroups = useRecoilComponentValueV2(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const isRecordGroupEmpty = useRecoilComponentFamilyValue(
    emptyRecordGroupByIdComponentFamilyState,
    recordGroupId,
  );

  return shouldHideEmptyRecordGroups && isRecordGroupEmpty;
};
