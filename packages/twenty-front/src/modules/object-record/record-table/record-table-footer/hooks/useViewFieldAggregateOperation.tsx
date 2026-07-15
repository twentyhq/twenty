import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableWidgetViewContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetViewContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useViewFieldAggregateOperation = () => {
  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { currentView: currentViewFromMetadataStore } =
    useGetCurrentViewOnly();
  const recordTableWidgetViewContext = useContext(RecordTableWidgetViewContext);
  const currentView =
    recordTableWidgetViewContext?.currentView ?? currentViewFromMetadataStore;

  const currentViewField = currentView?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  );

  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();
  const setViewFieldAggregateOperation = useSetAtomFamilyState(
    viewFieldAggregateOperationState,
    { viewFieldId: currentViewField?.id ?? '' },
  );
  const updateViewFieldAggregateOperation = async (
    aggregateOperation: ExtendedAggregateOperations | null,
  ) => {
    if (!currentViewField) {
      throw new Error('ViewField not found');
    }

    const convertedAggregateOperation = isDefined(aggregateOperation)
      ? convertExtendedAggregateOperationToAggregateOperation(aggregateOperation)
      : null;

    if (
      recordTableWidgetViewContext?.updateDraftViewFieldAggregateOperation
    ) {
      recordTableWidgetViewContext.updateDraftViewFieldAggregateOperation(
        fieldMetadataId,
        convertedAggregateOperation,
      );
      setViewFieldAggregateOperation(aggregateOperation);
      return;
    }

    await performViewFieldAPIUpdate([
      {
        input: {
          id: currentViewField.id,
          update: {
            isVisible: currentViewField.isVisible,
            position: currentViewField.position,
            size: currentViewField.size,
            aggregateOperation: convertedAggregateOperation,
          },
        },
      },
    ]);
    setViewFieldAggregateOperation(aggregateOperation);
  };

  const viewFieldAggregateOperation = useAtomFamilyStateValue(
    viewFieldAggregateOperationState,
    { viewFieldId: currentViewField?.id ?? '' },
  );

  return {
    updateViewFieldAggregateOperation,
    currentViewFieldAggregateOperation: viewFieldAggregateOperation,
  };
};
