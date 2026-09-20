import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { type RecordField } from '@/object-record/record-field/types/RecordField';

import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useCallback } from 'react';

export const useProcessOptionDropdownDragEnd = (recordTableId: string) => {
  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordTableId);

  const { saveViewFields } = useSaveCurrentViewFields();

  const processOptionDropdownDragEnd = useCallback(
    ({
      recordFieldToMove,
      targetRecordField,
    }: {
      recordFieldToMove: Pick<RecordField, 'id' | 'fieldMetadataItemId'>;
      targetRecordField: Pick<RecordField, 'id'>;
    }) => {
      const updatedRecordField = reorderVisibleRecordFields({
        recordFieldToMove,
        targetRecordField,
      });

      saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);
    },
    [reorderVisibleRecordFields, saveViewFields],
  );

  return {
    processOptionDropdownDragEnd,
  };
};
