import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteRecordTableColumn = (recordTableId: string) => {
  const store = useStore();
  const { performViewFieldApiDestroy } = usePerformViewFieldApiPersist();

  const deleteRecordTableColumn = useCallback(
    async (recordFieldId: string) => {
      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const previousRecordFields = store.get(currentRecordFieldsAtom);

      store.set(
        currentRecordFieldsAtom,
        previousRecordFields.filter(
          (recordField) => recordField.id !== recordFieldId,
        ),
      );

      const result = await performViewFieldApiDestroy([
        { input: { id: recordFieldId } },
      ]);

      // Restore only this column so changes made while the request was pending survive
      if (result.status === 'failed') {
        const deletedIndex = previousRecordFields.findIndex(
          (recordField) => recordField.id === recordFieldId,
        );
        const deletedRecordField = previousRecordFields[deletedIndex];

        store.set(currentRecordFieldsAtom, (latestRecordFields) =>
          !isDefined(deletedRecordField) ||
          latestRecordFields.some(({ id }) => id === recordFieldId)
            ? latestRecordFields
            : latestRecordFields.toSpliced(deletedIndex, 0, deletedRecordField),
        );
      }

      return result.status === 'successful';
    },
    [performViewFieldApiDestroy, recordTableId, store],
  );

  return { deleteRecordTableColumn };
};
