import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type View as GqlView } from '~/generated-metadata/graphql';

export const useUpdateViewAggregate = () => {
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
      objectMetadataItem: EnrichedObjectMetadataItem;
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
        const updatedView = updatedViewResult.response.data
          ?.updateView as GqlView;

        if (!isDefined(updatedView)) {
          return;
        }

        loadRecordIndexStates(updatedView, objectMetadataItem);
      }
    },
    [
      canPersistChanges,
      contextStoreCurrentViewId,
      performViewAPIUpdate,
      loadRecordIndexStates,
    ],
  );

  return {
    updateViewAggregate,
  };
};
