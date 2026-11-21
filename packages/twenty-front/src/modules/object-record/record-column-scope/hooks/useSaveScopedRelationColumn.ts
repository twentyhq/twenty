import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
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
  const { upsertRecordField } = useUpsertRecordField(recordTableId);
  const { updateRecordField } = useUpdateRecordField(recordTableId);

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
      const currentRecordFields = store.get(
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        }),
      );

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

      if (!isDefined(recordFieldId)) {
        upsertRecordField(savedRecordField);

        return true;
      }

      const isRecordFieldStillDisplayed = store
        .get(
          currentRecordFieldsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
        )
        .some(({ id }) => id === recordFieldId);

      // Only the scope is patched, so a resize made while saving is kept
      if (isRecordFieldStillDisplayed) {
        updateRecordField(recordFieldId, { relationScope });
      }

      return true;
    },
    [
      recordTableId,
      saveViewFields,
      store,
      updateRecordField,
      upsertRecordField,
    ],
  );

  return { saveScopedRelationColumn };
};
