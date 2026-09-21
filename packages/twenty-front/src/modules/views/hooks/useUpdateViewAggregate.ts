import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { getViewPersistTarget } from '@/object-record/record-table-widget/utils/getViewPersistTarget';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewApiUpdate } from '@/views/hooks/internal/usePerformViewApiUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type View as GqlView } from '~/generated-metadata/graphql';

export const useUpdateViewAggregate = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewApiUpdate } = usePerformViewApiUpdate();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

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
      const convertedKanbanAggregateOperation = isDefined(
        kanbanAggregateOperation,
      )
        ? convertExtendedAggregateOperationToAggregateOperation(
            kanbanAggregateOperation,
          )
        : null;

      const persistTarget = getViewPersistTarget(recordTableWidgetContext);

      if (persistTarget.target === 'none') {
        return;
      }

      if (persistTarget.target === 'pageLayoutDraft') {
        persistTarget.widgetContext.updateViewDraft({
          kanbanAggregateOperationFieldMetadataId,
          kanbanAggregateOperation: convertedKanbanAggregateOperation,
        });
        return;
      }

      if (!canPersistChanges) {
        return;
      }

      if (!isDefined(contextStoreCurrentViewId)) {
        return;
      }

      const updatedViewResult = await performViewApiUpdate({
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
      performViewApiUpdate,
      loadRecordIndexStates,
      recordTableWidgetContext,
    ],
  );

  return {
    updateViewAggregate,
  };
};
