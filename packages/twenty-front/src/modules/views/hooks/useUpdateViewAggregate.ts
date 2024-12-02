import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';

export const useUpdateViewAggregate = () => {
  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);
  const { updateView } = useUpdateView();
  const updateViewAggregate = ({
    kanbanAggregateOperationFieldMetadataId,
    kanbanAggregateOperation,
  }: {
    kanbanAggregateOperationFieldMetadataId: string | null;
    kanbanAggregateOperation: AGGREGATE_OPERATIONS;
  }) =>
    updateView({
      id: currentViewId,
      kanbanAggregateOperationFieldMetadataId,
      kanbanAggregateOperation,
    });

  const updateViewAggregateToCount = () => {
    updateViewAggregate({
      kanbanAggregateOperationFieldMetadataId: null,
      kanbanAggregateOperation: AGGREGATE_OPERATIONS.count,
    });
  };

  return {
    updateViewAggregateToCount,
    updateViewAggregate,
  };
};
