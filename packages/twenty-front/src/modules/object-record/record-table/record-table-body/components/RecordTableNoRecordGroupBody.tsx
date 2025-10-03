import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { RecordTableNoRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableNoRecordGroupBodyContextProvider';
import { RecordTableNoRecordGroupRows } from '@/object-record/record-table/components/RecordTableNoRecordGroupRows';
import { RecordTableBodyDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContextProvider';
import { RecordTableBodyDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { RecordTableVirtualizedDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataChangedEffect';
import { RecordTableVirtualizedRowTreadmillEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedRowTreadmillEffect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableNoRecordGroupBody = () => {
  const recordTableHasRecords = useRecoilComponentValue(
    recordIndexHasRecordsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
  );

  if (isRecordTableInitialLoading && !recordTableHasRecords) {
    return <RecordTableBodyLoading />;
  }

  return (
    <RecordTableNoRecordGroupBodyContextProvider>
      <RecordTableBodyDragDropContextProvider>
        <RecordTableBodyDroppable>
          <RecordTableNoRecordGroupRows />
          <RecordTableCellPortals />
        </RecordTableBodyDroppable>
        {!isRecordTableInitialLoading && recordTableHasRecords && (
          <RecordTableAggregateFooter />
        )}
        <RecordTableVirtualizedRowTreadmillEffect />
        <RecordTableVirtualizedDataChangedEffect />
      </RecordTableBodyDragDropContextProvider>
    </RecordTableNoRecordGroupBodyContextProvider>
  );
};
