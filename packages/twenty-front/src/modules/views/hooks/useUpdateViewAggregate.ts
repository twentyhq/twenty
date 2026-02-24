import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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

export const useUpdateViewAggregate = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const currentViewId = useRecoilComponentValueV2(
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

      if (!isDefined(currentViewId)) {
        return;
      }

      const updatedViewResult = await performViewAPIUpdate({
        id: currentViewId,
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

        jotaiStore.set(coreViewsState.atom, (currentCoreViews) =>
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
      currentViewId,
      performViewAPIUpdate,
      loadRecordIndexStates,
    ],
  );

  return {
    updateViewAggregate,
  };
};
