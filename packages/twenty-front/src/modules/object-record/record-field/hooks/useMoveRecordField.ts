import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';

export const useMoveRecordField = (recordTableId?: string) => {
  const store = useStore();
  const visibleRecordFields = useAtomComponentSelectorCallbackState(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const { saveViewFields } = useSaveCurrentViewFields();

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const moveRecordField = useCallback(
    async ({
      direction,
      fieldMetadataItemIdToMove,
    }: {
      direction: 'before' | 'after';
      fieldMetadataItemIdToMove: string;
    }) => {
      const visibleRecordFieldsValue = store.get(visibleRecordFields);

      const indexOfRecordFieldToMove = visibleRecordFieldsValue.findIndex(
        (recordField) =>
          recordField.fieldMetadataItemId === fieldMetadataItemIdToMove,
      );

      if (indexOfRecordFieldToMove === -1) {
        return;
      }

      const targetArrayIndex =
        direction === 'before'
          ? indexOfRecordFieldToMove - 1
          : indexOfRecordFieldToMove + 1;

      if (
        targetArrayIndex < 0 ||
        targetArrayIndex > visibleRecordFieldsValue.length - 1
      ) {
        return;
      }

      const currentRecordField =
        visibleRecordFieldsValue[indexOfRecordFieldToMove];
      const targetRecordField = visibleRecordFieldsValue[targetArrayIndex];

      const targetRecordFieldNewPosition = currentRecordField.position;
      const currentRecordFieldNewPosition = targetRecordField.position;

      updateRecordField(targetRecordField.fieldMetadataItemId, {
        position: targetRecordFieldNewPosition,
      });

      updateRecordField(currentRecordField.fieldMetadataItemId, {
        position: currentRecordFieldNewPosition,
      });

      await saveViewFields([
        mapRecordFieldToViewField({
          ...targetRecordField,
          position: targetRecordFieldNewPosition,
        }),
        mapRecordFieldToViewField({
          ...currentRecordField,
          position: currentRecordFieldNewPosition,
        }),
      ]);
    },
    [visibleRecordFields, saveViewFields, updateRecordField, store],
  );

  return { moveRecordField };
};
