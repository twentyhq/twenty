import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { type Nullable } from 'twenty-shared/types';

export const useIsTableRowSecondaryDragged = (recordId: Nullable<string>) => {
  const isSecondaryDragged = useRecoilComponentFamilyValueV2(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId: recordId ?? '' },
  );

  return {
    isSecondaryDragged,
  };
};
