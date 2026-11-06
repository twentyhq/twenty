import { RecordGroupTabs } from '@/object-record/record-group/components/RecordGroupTabs';
import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/components/RecordTableBodyContextProvider';
import { RecordTableNoRecordGroupRows } from '@/object-record/record-table/components/RecordTableNoRecordGroupRows';

import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableBodyNoRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyNoRecordGroupDragDropContextProvider';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { RecordTableVirtualizedDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataChangedEffect';
import { RecordTableVirtualizedJunctionDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedJunctionDataChangedEffect';
import { RecordTableVirtualizedSSESubscribeEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedSSESubscribeEffect';
import { RecordTableVirtualizedScrollEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedScrollEffect';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableNoRecordGroupBody = () => {
  const recordTableHasRecords = useAtomComponentSelectorValue(
    recordIndexHasRecordsComponentSelector,
  );

  const isRecordTableInitialLoading = useAtomComponentStateValue(
    isRecordTableInitialLoadingComponentState,
  );

  const isInitialLoadingDisplayed =
    isRecordTableInitialLoading && !recordTableHasRecords;

  return (
    <RecordTableBodyContextProvider>
      <RecordTableBodyNoRecordGroupDragDropContextProvider>
        <RecordGroupTabs
          viewType={ViewType.TABLE}
          dndType={RECORD_TABLE_ROW_DND_TYPE}
        />
        {isInitialLoadingDisplayed ? (
          <RecordTableBodyLoading />
        ) : (
          <>
            <RecordTableBody>
              <RecordTableNoRecordGroupRows />
              <RecordTableCellPortals />
            </RecordTableBody>
            {!isRecordTableInitialLoading && recordTableHasRecords && (
              <RecordTableAggregateFooter />
            )}
            <RecordTableVirtualizedScrollEffect />
            <RecordTableVirtualizedDataChangedEffect />
            <RecordTableVirtualizedJunctionDataChangedEffect />
            <RecordTableVirtualizedSSESubscribeEffect />
          </>
        )}
      </RecordTableBodyNoRecordGroupDragDropContextProvider>
    </RecordTableBodyContextProvider>
  );
};
