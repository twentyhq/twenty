import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateViewAggregate = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { updateView } = usePersistView();

  const setRecordIndexKanbanAggregateOperationState = useSetRecoilState(
    recordIndexKanbanAggregateOperationState,
  );

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const updateViewAggregate = useCallback(
    ({
      kanbanAggregateOperationFieldMetadataId,
      kanbanAggregateOperation,
      objectMetadataId,
    }: {
      kanbanAggregateOperationFieldMetadataId: string | null;
      kanbanAggregateOperation: ExtendedAggregateOperations | null;
      objectMetadataId: string;
    }) => {
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

      updateView({
        id: currentViewId,
        input: {
          kanbanAggregateOperationFieldMetadataId,
          kanbanAggregateOperation: convertedKanbanAggregateOperation,
        },
      });

      setRecordIndexKanbanAggregateOperationState({
        operation: kanbanAggregateOperation,
        fieldMetadataId: kanbanAggregateOperationFieldMetadataId,
      });

      refreshCoreViewsByObjectMetadataId(objectMetadataId);
    },
    [
      currentViewId,
      updateView,
      setRecordIndexKanbanAggregateOperationState,
      refreshCoreViewsByObjectMetadataId,
    ],
  );

  return {
    updateViewAggregate,
  };
};
