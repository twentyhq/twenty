import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { type Nullable } from 'twenty-shared/types';

export const useIsTableRowSecondaryDragged = (recordId: Nullable<string>) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId: recordId ?? '' },
    recordIndexId,
  );

  return {
    isSecondaryDragged: isRecordIdSecondaryDragMultiple,
  };
};
