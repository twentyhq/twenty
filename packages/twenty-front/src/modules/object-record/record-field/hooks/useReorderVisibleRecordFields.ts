import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useReorderVisibleRecordFields = (recordTableId: string) => {
  const store = useStore();
  const visibleRecordFields = useRecoilComponentSelectorCallbackStateV2(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const currentRecordFields = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const reorderVisibleRecordFields = useCallback(
    ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      const visibleRecordFieldsValue = store.get(visibleRecordFields);
      const currentRecordFieldsValue = store.get(currentRecordFields);

      const idOfRecordToMove = visibleRecordFieldsValue[fromIndex].id;
      const idOfTargetRecord = visibleRecordFieldsValue[toIndex].id;

      const recordToMove = visibleRecordFieldsValue[fromIndex];

      const isDroppedAfterList = toIndex >= visibleRecordFieldsValue.length;

      const newPositionOfTargetRecord = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: currentRecordFieldsValue,
        idOfItemToMove: idOfRecordToMove,
        idOfTargetItem: idOfTargetRecord,
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
