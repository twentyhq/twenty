import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { isRecordFieldSupportedByViewType } from '@/object-record/record-field/utils/isRecordFieldSupportedByViewType';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteRecordTableColumn = (recordTableId: string) => {
  const store = useStore();
  const { performViewFieldApiDestroy } = usePerformViewFieldApiPersist();
  const { canPersistChanges } = useCanPersistViewChanges();

  const deleteRecordTableColumn = useCallback(
    async (recordFieldId: string) => {
      if (!canPersistChanges) {
        return false;
      }

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

      // A view field sync during the request can bring the column back from not yet updated metadata
      if (result.status === 'successful') {
        store.set(currentRecordFieldsAtom, (latestRecordFields) =>
          latestRecordFields.filter(
            (recordField) => recordField.id !== recordFieldId,
          ),
        );
      }

      // Restore only this column so changes made while the request was pending survive
      if (result.status === 'failed') {
        const deletedIndex = previousRecordFields.findIndex(
          (recordField) => recordField.id === recordFieldId,
        );
        const deletedRecordField = previousRecordFields[deletedIndex];
        // The layout may have switched meanwhile, and only tables show extra columns
        const viewType = store.get(
          recordIndexViewTypeState.atomFamily({ instanceId: recordTableId }),
        );

        store.set(currentRecordFieldsAtom, (latestRecordFields) =>
          !isDefined(deletedRecordField) ||
          (isDefined(viewType) &&
            !isRecordFieldSupportedByViewType({
              recordField: deletedRecordField,
              viewType,
            })) ||
          latestRecordFields.some(({ id }) => id === recordFieldId)
            ? latestRecordFields
            : latestRecordFields.toSpliced(deletedIndex, 0, deletedRecordField),
        );
      }

      return result.status === 'successful';
    },
    [canPersistChanges, performViewFieldApiDestroy, recordTableId, store],
  );

  return { deleteRecordTableColumn };
};
