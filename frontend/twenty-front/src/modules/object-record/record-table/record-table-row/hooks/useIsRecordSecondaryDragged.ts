import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { type Nullable } from 'twenty-shared/types';

export const useIsTableRowSecondaryDragged = (recordId: Nullable<string>) => {
  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId: recordId ?? '' },
  );

  return {
    isSecondaryDragged: isRecordIdSecondaryDragMultiple,
  };
};
