import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeInsertedRecordFieldPosition } from '@/object-record/record-table/utils/computeInsertedRecordFieldPosition';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

export const useAddRecordTableColumn = (recordTableId: string) => {
  const store = useStore();
  const { upsertRecordField } = useUpsertRecordField(recordTableId);
  const { saveViewFields } = useSaveCurrentViewFields();

  const addRecordTableColumn = useCallback(
    async (sourceRecordField: RecordField) => {
      const currentRecordFields = store.get(
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        }),
      );

      const recordFieldToCreate: RecordField = {
        id: v4(),
        fieldMetadataItemId: sourceRecordField.fieldMetadataItemId,
        position: computeInsertedRecordFieldPosition({
          recordFields: currentRecordFields,
          afterRecordField: sourceRecordField,
        }),
        isVisible: true,
        isCanonical: false,
        size: sourceRecordField.size,
      };

      upsertRecordField(recordFieldToCreate);

      await saveViewFields([mapRecordFieldToViewField(recordFieldToCreate)]);

      return recordFieldToCreate;
    },
    [recordTableId, saveViewFields, store, upsertRecordField],
  );

  return { addRecordTableColumn };
};
