import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { buildRecordTableLookupColumn } from '@/object-record/record-table/utils/buildRecordTableLookupColumn';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useAddRecordTableLookupColumn = (recordTableId: string) => {
  const store = useStore();
  const { currentView } = useGetCurrentViewOnly();
  const { performViewFieldApiCreate } = usePerformViewFieldApiPersist();

  const addRecordTableLookupColumn = useCallback(
    async ({
      relationFieldMetadataItemId,
      relationTargetFieldMetadataId,
    }: {
      relationFieldMetadataItemId: string;
      relationTargetFieldMetadataId: string;
    }) => {
      if (!isDefined(currentView)) {
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
            viewId: currentView.id,
            fieldMetadataId: lookupColumn.fieldMetadataItemId,
            relationTargetFieldMetadataId,
            isCanonical: false,
            isVisible: lookupColumn.isVisible,
            position: lookupColumn.position,
            size: lookupColumn.size,
          },
        ],
      });

      if (result.status === 'failed') {
        store.set(currentRecordFieldsAtom, (recordFields) =>
          recordFields.filter(({ id }) => id !== lookupColumn.id),
        );
      }

      return result.status === 'successful';
    },
    [currentView, performViewFieldApiCreate, recordTableId, store],
  );

  return { addRecordTableLookupColumn };
};
