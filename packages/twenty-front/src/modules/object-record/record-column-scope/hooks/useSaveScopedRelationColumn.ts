import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { buildAddedRecordField } from '@/object-record/record-field/utils/buildAddedRecordField';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

      const recordFieldToSave = isDefined(recordFieldId)
        ? currentRecordFields.find(({ id }) => id === recordFieldId)
        : buildAddedRecordField({ currentRecordFields, fieldMetadataItemId });

      if (!isDefined(recordFieldToSave)) {
        return false;
      }

      const savedRecordField = { ...recordFieldToSave, relationScope };

      const isSaved = await saveViewFields([
        mapRecordFieldToViewField(savedRecordField),
      ]);

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
