import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { buildRecordTableLookupColumn } from '@/object-record/record-table/utils/buildRecordTableLookupColumn';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useAddRecordTableLookupColumn = (recordTableId: string) => {
  const store = useStore();
  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewFieldApiCreate } = usePerformViewFieldApiPersist();

  const addRecordTableLookupColumn = useCallback(
    async ({
      relationFieldMetadataItemId,
      relationTargetFieldMetadataId,
    }: {
      relationFieldMetadataItemId: string;
      relationTargetFieldMetadataId: string;
    }) => {
      const currentViewId = store.get(currentViewIdCallbackState);

      if (!isDefined(currentViewId)) {
        return false;
      }

      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const lookupColumn = buildRecordTableLookupColumn({
        relationFieldMetadataItemId,
        relationTargetFieldMetadataId,
        recordFields: store.get(currentRecordFieldsAtom),
      });

      store.set(currentRecordFieldsAtom, (recordFields) => [
        ...recordFields,
        lookupColumn,
      ]);

      const result = await performViewFieldApiCreate({
        inputs: [
          {
            id: lookupColumn.id,
            viewId: currentViewId,
            fieldMetadataId: lookupColumn.fieldMetadataItemId,
            relationTargetFieldMetadataId,
            isCanonical: false,
            isVisible: lookupColumn.isVisible,
            position: lookupColumn.position,
            size: lookupColumn.size,
          },
        ],
      });

      // A view field sync during the request can drop the column, from not yet updated metadata
      if (result.status === 'successful') {
        store.set(currentRecordFieldsAtom, (recordFields) =>
          recordFields.some(({ id }) => id === lookupColumn.id)
            ? recordFields
            : [...recordFields, lookupColumn],
        );
      }

      if (result.status === 'failed') {
        store.set(currentRecordFieldsAtom, (recordFields) =>
          recordFields.filter(({ id }) => id !== lookupColumn.id),
        );
      }

      return result.status === 'successful';
    },
    [
      currentViewIdCallbackState,
      performViewFieldApiCreate,
      recordTableId,
      store,
    ],
  );

  return { addRecordTableLookupColumn };
};
