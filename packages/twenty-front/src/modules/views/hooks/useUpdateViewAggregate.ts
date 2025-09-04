import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useUpdateViewAggregate = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { updateView } = useUpdateView();

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
      const convertedKanbanAggregateOperation =
        convertExtendedAggregateOperationToAggregateOperation(
          kanbanAggregateOperation,
        );
      updateView({
        id: currentViewId,
        kanbanAggregateOperationFieldMetadataId,
        kanbanAggregateOperation: convertedKanbanAggregateOperation,
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
