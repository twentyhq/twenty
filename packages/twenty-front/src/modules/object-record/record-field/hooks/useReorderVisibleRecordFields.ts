import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useReorderVisibleRecordFields = (recordTableId: string) => {
  const store = useStore();

  const currentRecordFields = useAtomComponentStateCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  // Callers resolve both fields from the list they rendered, so a drop is
  // never re-interpreted against a differently shaped array.
  const reorderVisibleRecordFields = useCallback(
    ({
      recordFieldToMove,
      targetRecordField,
    }: {
      recordFieldToMove: RecordField;
      targetRecordField: RecordField;
    }) => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: store.get(currentRecordFields),
        idOfItemToMove: recordFieldToMove.id,
        idOfTargetItem: targetRecordField.id,
        isDroppedAfterList: false,
      });

      updateRecordField(recordFieldToMove.fieldMetadataItemId, {
        position: newPosition,
      });

      const updatedRecordField: RecordField = {
        ...recordFieldToMove,
        position: newPosition,
      };

      return updatedRecordField;
    },
    [currentRecordFields, updateRecordField, store],
  );

  return { reorderVisibleRecordFields };
};
