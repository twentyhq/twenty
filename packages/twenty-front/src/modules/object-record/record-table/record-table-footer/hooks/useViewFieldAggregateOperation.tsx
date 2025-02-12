import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const useViewFieldAggregateOperation = () => {
  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { currentViewWithSavedFiltersAndSorts } = useGetCurrentView();

  const currentViewField =
    currentViewWithSavedFiltersAndSorts?.viewFields?.find(
      (viewField) => viewField.fieldMetadataId === fieldMetadataId,
    );
  const { updateViewFieldRecords } = usePersistViewFieldRecords();
  const updateViewFieldAggregateOperation = (
    aggregateOperation: ExtendedAggregateOperations | null,
  ) => {
    if (!currentViewField) {
      throw new Error('ViewField not found');
    }
    updateViewFieldRecords([
      {
        ...currentViewField,
        aggregateOperation:
          convertExtendedAggregateOperationToAggregateOperation(
            aggregateOperation,
          ),
      },
    ]);
  };

  const currentViewFieldAggregateOperation = useRecoilValue(
    viewFieldAggregateOperationState({
      viewFieldId: currentViewField?.id ?? '',
    }),
  );

  return {
    updateViewFieldAggregateOperation,
    currentViewFieldAggregateOperation,
  };
};
