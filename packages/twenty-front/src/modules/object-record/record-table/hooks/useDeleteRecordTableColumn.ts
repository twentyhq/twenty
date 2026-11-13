import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { scopeViewFromOwnerViewFieldIdFamilySelector } from '@/views/states/selectors/scopeViewFromOwnerViewFieldIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteRecordTableColumn = (recordTableId: string) => {
  const store = useStore();
  const { performViewFieldApiDestroy } = usePerformViewFieldApiPersist();
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const deleteRecordTableColumn = useCallback(
    async (recordFieldId: string) => {
      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const previousRecordFields = store.get(currentRecordFieldsAtom);
      const scopeView = store.get(
        scopeViewFromOwnerViewFieldIdFamilySelector.selectorFamily({
          ownerViewFieldId: recordFieldId,
        }),
      );

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

        return false;
      }

      // The server deletes the scope view along with the column that owns it
      if (isDefined(scopeView)) {
        removeFromDraft({ key: 'views', itemIds: [scopeView.id] });
        applyChanges();
      }

      return true;
    },
    [
      applyChanges,
      performViewFieldApiDestroy,
      recordTableId,
      removeFromDraft,
      store,
    ],
  );

  return { deleteRecordTableColumn };
};
