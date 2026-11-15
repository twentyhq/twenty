import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import {
  buildRecordTableRelationColumn,
  type RecordTableRelationColumnTarget,
} from '@/object-record/record-table/utils/buildRecordTableRelationColumn';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useAddRecordTableRelationColumn = (recordTableId: string) => {
  const store = useStore();
  const { currentView } = useGetCurrentViewOnly();
  const { performViewFieldApiCreate } = usePerformViewFieldApiPersist();

  const addRecordTableRelationColumn = useCallback(
    async ({
      relationFieldMetadataItemId,
      ...relationColumnTarget
    }: {
      relationFieldMetadataItemId: string;
    } & RecordTableRelationColumnTarget) => {
      if (!isDefined(currentView)) {
        return false;
      }

      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const relationColumn = buildRecordTableRelationColumn({
        relationFieldMetadataItemId,
        ...relationColumnTarget,
        recordFields: store.get(currentRecordFieldsAtom),
      });

      store.set(currentRecordFieldsAtom, (recordFields) => [
        ...recordFields,
        relationColumn,
      ]);

      const result = await performViewFieldApiCreate({
        inputs: [
          {
            id: relationColumn.id,
            viewId: currentView.id,
            fieldMetadataId: relationColumn.fieldMetadataItemId,
            relationTargetFieldMetadataId:
              relationColumn.relationTargetFieldMetadataId,
            relationAggregateOperation:
              relationColumn.relationAggregateOperation,
            isCanonical: false,
            isVisible: relationColumn.isVisible,
            position: relationColumn.position,
            size: relationColumn.size,
          },
        ],
      });

      if (result.status === 'failed') {
        store.set(currentRecordFieldsAtom, (recordFields) =>
          recordFields.filter(({ id }) => id !== relationColumn.id),
        );
      }

      return result.status === 'successful';
    },
    [currentView, performViewFieldApiCreate, recordTableId, store],
  );

  return { addRecordTableRelationColumn };
};
