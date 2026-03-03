import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useCallback } from 'react';
import {
  isDefined,
  upsertIntoArrayOfObjectsComparingId,
} from 'twenty-shared/utils';
import { type CoreView } from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

export const useUpdateViewAggregate = () => {
  const store = useStore();
  const { canPersistChanges } = useCanPersistViewChanges();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const updateViewAggregate = useCallback(
    async ({
      kanbanAggregateOperationFieldMetadataId,
      kanbanAggregateOperation,
      objectMetadataItem,
    }: {
      kanbanAggregateOperationFieldMetadataId: string | null;
      kanbanAggregateOperation: ExtendedAggregateOperations | null;
      objectMetadataItem: ObjectMetadataItem;
    }) => {
      if (!canPersistChanges) {
        return;
      }

      const convertedKanbanAggregateOperation = isDefined(
        kanbanAggregateOperation,
      )
        ? convertExtendedAggregateOperationToAggregateOperation(
            kanbanAggregateOperation,
          )
        : null;

      if (!isDefined(contextStoreCurrentViewId)) {
        return;
      }

      const updatedViewResult = await performViewAPIUpdate({
        id: contextStoreCurrentViewId,
        input: {
          kanbanAggregateOperationFieldMetadataId,
          kanbanAggregateOperation: convertedKanbanAggregateOperation,
        },
      });

      if (updatedViewResult.status === 'successful') {
        const updatedCoreView = updatedViewResult.response.data
          ?.updateCoreView as CoreView;

        if (!isDefined(updatedCoreView)) {
          return;
        }

        store.set(coreViewsState.atom, (currentCoreViews) =>
          upsertIntoArrayOfObjectsComparingId(
            currentCoreViews,
            updatedCoreView,
          ),
        );

        const updatedView = convertCoreViewToView(updatedCoreView);

        loadRecordIndexStates(updatedView, objectMetadataItem);
      }
    },
    [
      canPersistChanges,
      contextStoreCurrentViewId,
      performViewAPIUpdate,
      loadRecordIndexStates,
      store,
    ],
  );

  return {
    updateViewAggregate,
  };
};
