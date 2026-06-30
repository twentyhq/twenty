import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useViewFieldAggregateOperation = () => {
  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { currentView } = useGetCurrentViewOnly();

  const currentViewField = currentView?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  );

  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();
  const { canPersistChanges } = useCanPersistViewChanges();
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

    if (!canPersistChanges) {
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
            aggregateOperation: isDefined(aggregateOperation)
              ? convertExtendedAggregateOperationToAggregateOperation(
                  aggregateOperation,
                )
              : null,
          },
        },
      },
    ]);
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
