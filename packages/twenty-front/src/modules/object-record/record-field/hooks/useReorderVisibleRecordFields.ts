import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useCallback } from 'react';

export const useReorderVisibleRecordFields = (recordTableId: string) => {
  const visibleRecordFieldsAtom = useRecoilComponentSelectorCallbackStateV2(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const currentRecordFieldsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const reorderVisibleRecordFields = useCallback(
    ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      const visibleRecordFields = jotaiStore.get(visibleRecordFieldsAtom);
      const currentRecordFields = jotaiStore.get(currentRecordFieldsAtom);

      const idOfRecordToMove = visibleRecordFields[fromIndex].id;
      const idOfTargetRecord = visibleRecordFields[toIndex].id;

      const recordToMove = visibleRecordFields[fromIndex];

      const isDroppedAfterList = toIndex >= visibleRecordFields.length;

      const newPositionOfTargetRecord = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: currentRecordFields,
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
    [currentRecordFieldsAtom, visibleRecordFieldsAtom, updateRecordField],
  );

  return { reorderVisibleRecordFields };
};
