import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useShouldHideRecordGroup = (recordGroupId: string): boolean => {
  const shouldHideEmptyRecordGroups = useRecoilComponentValueV2(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const isRecordGroupEmpty = useRecoilComponentFamilyValueV2(
    emptyRecordGroupByIdComponentFamilyState,
    recordGroupId,
  );

  return shouldHideEmptyRecordGroups && isRecordGroupEmpty;
};
