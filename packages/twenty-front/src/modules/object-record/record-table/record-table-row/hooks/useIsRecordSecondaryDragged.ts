import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { type Nullable } from 'twenty-shared/types';

export const useIsTableRowSecondaryDragged = (recordId: Nullable<string>) => {
  const isSecondaryDragged = useRecoilComponentFamilyValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId: recordId ?? '' },
  );

  return {
    isSecondaryDragged,
  };
};
