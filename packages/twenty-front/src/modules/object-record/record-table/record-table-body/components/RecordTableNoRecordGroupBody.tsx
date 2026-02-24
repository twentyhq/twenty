import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { RecordTableNoRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableNoRecordGroupBodyContextProvider';
import { RecordTableNoRecordGroupRows } from '@/object-record/record-table/components/RecordTableNoRecordGroupRows';

import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableBodyNoRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyNoRecordGroupDragDropContextProvider';
import { RecordTableBodyNoRecordGroupDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyNoRecordGroupDroppable';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { RecordTableVirtualizedDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataChangedEffect';
import { RecordTableVirtualizedSSESubscribeEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedSSESubscribeEffect';
import { RecordTableVirtualizedRowTreadmillEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedRowTreadmillEffect';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const RecordTableNoRecordGroupBody = () => {
  const recordTableHasRecords = useRecoilComponentSelectorValueV2(
    recordIndexHasRecordsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
  );

  if (isRecordTableInitialLoading && !recordTableHasRecords) {
    return <RecordTableBodyLoading />;
  }

  return (
    <RecordTableNoRecordGroupBodyContextProvider>
      <RecordTableBodyNoRecordGroupDragDropContextProvider>
        <RecordTableBodyNoRecordGroupDroppable>
          <RecordTableNoRecordGroupRows />
          <RecordTableCellPortals />
        </RecordTableBodyNoRecordGroupDroppable>
        {!isRecordTableInitialLoading && recordTableHasRecords && (
          <RecordTableAggregateFooter />
        )}
        <RecordTableVirtualizedRowTreadmillEffect />
        <RecordTableVirtualizedDataChangedEffect />
        <RecordTableVirtualizedSSESubscribeEffect />
      </RecordTableBodyNoRecordGroupDragDropContextProvider>
    </RecordTableNoRecordGroupBodyContextProvider>
  );
};
