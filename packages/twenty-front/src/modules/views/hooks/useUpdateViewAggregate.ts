import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCallback, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type View as GqlView } from '~/generated-metadata/graphql';

export const useUpdateViewAggregate = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const setRecordIndexGroupAggregateOperation = useSetAtomComponentState(
    recordIndexGroupAggregateOperationComponentState,
  );
  const setRecordIndexGroupAggregateFieldMetadataItem =
    useSetAtomComponentState(
      recordIndexGroupAggregateFieldMetadataItemComponentState,
    );

  const recordIndexGroupAggregateOperation = useAtomComponentStateValue(
    recordIndexGroupAggregateOperationComponentState,
  );
  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  // oxlint-disable-next-line twenty/no-state-useref
  const latestRequestIdRef = useRef(0);
  // oxlint-disable-next-line twenty/no-state-useref
  const lastConfirmedStateRef = useRef({
    operation: recordIndexGroupAggregateOperation,
    fieldMetadataItem: recordIndexGroupAggregateFieldMetadataItem,
  });

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

      const requestId = ++latestRequestIdRef.current;

      const newFieldMetadataItem =
        objectMetadataItem.fields?.find(
          (field) => field.id === kanbanAggregateOperationFieldMetadataId,
        ) ?? null;

      setRecordIndexGroupAggregateOperation(kanbanAggregateOperation);
      setRecordIndexGroupAggregateFieldMetadataItem(newFieldMetadataItem);

      const updatedViewResult = await performViewAPIUpdate({
        id: contextStoreCurrentViewId,
        input: {
          kanbanAggregateOperationFieldMetadataId,
          kanbanAggregateOperation: convertedKanbanAggregateOperation,
        },
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (updatedViewResult.status === 'successful') {
        const updatedView = updatedViewResult.response.data
          ?.updateView as GqlView;

        if (!isDefined(updatedView)) {
          return;
        }

        lastConfirmedStateRef.current = {
          operation: kanbanAggregateOperation,
          fieldMetadataItem: newFieldMetadataItem,
        };

        loadRecordIndexStates(updatedView, objectMetadataItem);
      } else {
        setRecordIndexGroupAggregateOperation(
          lastConfirmedStateRef.current.operation ?? null,
        );
        setRecordIndexGroupAggregateFieldMetadataItem(
          lastConfirmedStateRef.current.fieldMetadataItem ?? null,
        );
      }
    },
    [
      canPersistChanges,
      contextStoreCurrentViewId,
      performViewAPIUpdate,
      loadRecordIndexStates,
      setRecordIndexGroupAggregateOperation,
      setRecordIndexGroupAggregateFieldMetadataItem,
    ],
  );

  return {
    updateViewAggregate,
  };
};
