import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import {
  buildRecordTableRelationColumn,
  type RecordTableRelationColumnTarget,
} from '@/object-record/record-table/utils/buildRecordTableRelationColumn';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useAddRecordTableRelationColumn = (recordTableId: string) => {
  const store = useStore();
  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewFieldApiCreate } = usePerformViewFieldApiPersist();

  const addRecordTableRelationColumn = useCallback(
    async ({
      relationFieldMetadataItemId,
      ...relationColumnTarget
    }: {
      relationFieldMetadataItemId: string;
    } & RecordTableRelationColumnTarget) => {
      const currentViewId = store.get(currentViewIdCallbackState);

      if (!isDefined(currentViewId)) {
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
            viewId: currentViewId,
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
    [
      currentViewIdCallbackState,
      performViewFieldApiCreate,
      recordTableId,
      store,
    ],
  );

  return { addRecordTableRelationColumn };
};
