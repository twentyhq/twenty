import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const useViewFieldAggregateOperation = () => {
  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { currentView } = useGetCurrentViewOnly();

  const currentViewField = currentView?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  );

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { updateViewFieldRecords } = usePersistViewFieldRecords();
  const updateViewFieldAggregateOperation = async (
    aggregateOperation: ExtendedAggregateOperations | null,
  ) => {
    if (!currentViewField) {
      throw new Error('ViewField not found');
    }
    await updateViewFieldRecords([
      {
        input: {
          id: currentViewField.id,
          update: {
            isVisible: currentViewField.isVisible,
            position: currentViewField.position,
            size: currentViewField.size,
            aggregateOperation:
              convertExtendedAggregateOperationToAggregateOperation(
                aggregateOperation,
              ),
          },
        },
      },
    ]);

    refreshCoreViewsByObjectMetadataId(objectMetadataItem.id);
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
