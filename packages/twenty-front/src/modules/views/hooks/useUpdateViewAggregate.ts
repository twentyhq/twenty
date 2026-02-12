import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useRecoilCallback } from 'recoil';
import {
  isDefined,
  upsertIntoArrayOfObjectsComparingId,
} from 'twenty-shared/utils';
import { type CoreView } from '~/generated-metadata/graphql';

export const useUpdateViewAggregate = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const updateViewAggregate = useRecoilCallback(
    ({ set }) =>
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

          set(coreViewsState, (currentCoreViews) =>
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
