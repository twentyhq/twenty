import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useDeleteRecordTableColumn = (recordTableId: string) => {
  const store = useStore();
  const { performViewFieldApiDestroy } = usePerformViewFieldApiPersist();

  const deleteRecordTableColumn = useCallback(
    async (recordFieldId: string) => {
      store.set(
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        }),
        (previousRecordFields) =>
          previousRecordFields.filter(
            (recordField) => recordField.id !== recordFieldId,
          ),
      );

      await performViewFieldApiDestroy([{ input: { id: recordFieldId } }]);
    },
    [performViewFieldApiDestroy, recordTableId, store],
  );

  return { deleteRecordTableColumn };
};
