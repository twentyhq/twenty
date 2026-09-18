import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useReorderVisibleRecordFields = (recordTableId: string) => {
  const store = useStore();
  const visibleRecordFields = useAtomComponentSelectorCallbackState(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const currentRecordFields = useAtomComponentStateCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const reorderVisibleRecordFields = useCallback(
    ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      const visibleRecordFieldsValue = store.get(visibleRecordFields);
      const currentRecordFieldsValue = store.get(currentRecordFields);

      const isDroppedAfterList = toIndex >= visibleRecordFieldsValue.length;

      const recordToMove = visibleRecordFieldsValue[fromIndex];
      const targetRecord = isDroppedAfterList
        ? visibleRecordFieldsValue[visibleRecordFieldsValue.length - 1]
        : visibleRecordFieldsValue[toIndex];

      const newPositionOfTargetRecord = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: currentRecordFieldsValue,
        idOfItemToMove: recordToMove.id,
        idOfTargetItem: targetRecord.id,
        isDroppedAfterList,
      });

      updateRecordField(recordToMove.fieldMetadataItemId, {
        position: newPositionOfTargetRecord,
      });

      const updatedRecordField: RecordField = {
        ...recordToMove,
        position: newPositionOfTargetRecord,
      };

      return updatedRecordField;
    },
    [currentRecordFields, visibleRecordFields, updateRecordField, store],
  );

  return { reorderVisibleRecordFields };
};
