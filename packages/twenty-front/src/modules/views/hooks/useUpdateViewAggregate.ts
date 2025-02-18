import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { useCallback } from 'react';

export const useUpdateViewAggregate = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );
  const { updateView } = useUpdateView();
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
    },
    [currentViewId, updateView],
  );

  return {
    updateViewAggregate,
  };
};
