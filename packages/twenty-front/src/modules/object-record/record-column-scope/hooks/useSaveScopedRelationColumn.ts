import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useSaveScopedRelationColumn = (recordTableId: string) => {
  const store = useStore();
  const { saveViewFields } = useSaveCurrentViewFields();

  const saveScopedRelationColumn = useCallback(
    async ({
      fieldMetadataItemId,
      recordFieldId,
      relationScope,
    }: {
      fieldMetadataItemId: string;
      recordFieldId?: string;
      relationScope: ViewFieldRelationScope;
    }): Promise<boolean> => {
      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const currentRecordFields = store.get(currentRecordFieldsAtom);

      const recordFieldToSave: RecordField | undefined = isDefined(
        recordFieldId,
      )
        ? currentRecordFields.find(({ id }) => id === recordFieldId)
        : {
            id: v4(),
            fieldMetadataItemId,
            size: 100,
            isVisible: true,
            isCanonical: false,
            position:
              Math.max(
                0,
                ...currentRecordFields.map(({ position }) => position),
              ) + 1,
          };

      if (!isDefined(recordFieldToSave)) {
        return false;
      }

      const savedRecordField = { ...recordFieldToSave, relationScope };

      const isSaved = await saveViewFields([
        mapRecordFieldToViewField(savedRecordField),
      ]);

      // The table only gets the column once it is saved, so a failed save leaves nothing to roll back
      if (!isSaved) {
        return false;
      }

      store.set(currentRecordFieldsAtom, (latestRecordFields) =>
        latestRecordFields.some(({ id }) => id === savedRecordField.id)
          ? latestRecordFields.map((recordField) =>
              recordField.id === savedRecordField.id
                ? { ...recordField, relationScope }
                : recordField,
            )
          : [...latestRecordFields, savedRecordField],
      );

      return true;
    },
    [recordTableId, saveViewFields, store],
  );

  return { saveScopedRelationColumn };
};
