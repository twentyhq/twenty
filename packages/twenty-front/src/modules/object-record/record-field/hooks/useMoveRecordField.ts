import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { isDefined } from 'twenty-shared/utils';

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

      const targetArrayIndex =
        direction === 'before'
          ? indexOfRecordFieldToMove - 1
          : indexOfRecordFieldToMove + 1;

      const currentRecordField =
        visibleRecordFieldsValue[indexOfRecordFieldToMove];
      const targetRecordField = visibleRecordFieldsValue[targetArrayIndex];

      if (!isDefined(currentRecordField) || !isDefined(targetRecordField)) {
        return;
      }

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
