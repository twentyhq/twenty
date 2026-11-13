import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';

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

      if (result.status === 'failed') {
        store.set(currentRecordFieldsAtom, previousRecordFields);
      }

      return result.status === 'successful';
    },
    [performViewFieldApiDestroy, recordTableId, store],
  );

  return { deleteRecordTableColumn };
};
