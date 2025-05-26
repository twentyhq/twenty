import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useUpdateViewAggregate = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );
  const { updateView } = useUpdateView();

  const setRecordIndexKanbanAggregateOperationState = useSetRecoilState(
    recordIndexKanbanAggregateOperationState,
  );

  const updateViewAggregate = useCallback(
    ({
      kanbanAggregateOperationFieldMetadataId,
      kanbanAggregateOperation,
    }: {
      kanbanAggregateOperationFieldMetadataId: string | null;
      kanbanAggregateOperation: ExtendedAggregateOperations | null;
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
    },
    [currentViewId, updateView, setRecordIndexKanbanAggregateOperationState],
  );

  return {
    updateViewAggregate,
  };
};
