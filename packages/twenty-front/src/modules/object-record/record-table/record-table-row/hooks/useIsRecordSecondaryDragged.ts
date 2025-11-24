import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

export const useIsTableRowSecondaryDragged = (recordId: string | null) => {
  const isSecondaryDragged = useRecoilComponentFamilyValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId: recordId ?? '' },
  );

  return {
    isSecondaryDragged,
  };
};
