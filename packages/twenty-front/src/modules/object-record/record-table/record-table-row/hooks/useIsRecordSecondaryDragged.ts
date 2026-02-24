import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useAtomComponentFamilyValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyValue';
import { type Nullable } from 'twenty-shared/types';

export const useIsTableRowSecondaryDragged = (recordId: Nullable<string>) => {
  const isSecondaryDragged = useAtomComponentFamilyValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId: recordId ?? '' },
  );

  return {
    isSecondaryDragged,
  };
};
