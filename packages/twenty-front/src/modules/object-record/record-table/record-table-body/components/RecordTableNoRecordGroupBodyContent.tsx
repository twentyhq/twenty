import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { RecordTableNoRecordGroupRows } from '@/object-record/record-table/components/RecordTableNoRecordGroupRows';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { isRecordTableEmptyStateHiddenComponentState } from '@/object-record/record-table/states/isRecordTableEmptyStateHiddenComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { RecordTableVirtualizedDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataChangedEffect';
import { RecordTableVirtualizedJunctionDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedJunctionDataChangedEffect';
import { RecordTableVirtualizedSSESubscribeEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedSSESubscribeEffect';
import { RecordTableVirtualizedScrollEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedScrollEffect';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableNoRecordGroupBodyContent = () => {
  const recordTableHasRecords = useAtomComponentSelectorValue(
    recordIndexHasRecordsComponentSelector,
  );

  const isRecordTableInitialLoading = useAtomComponentStateValue(
    isRecordTableInitialLoadingComponentState,
  );

  const isRecordGroupTabsDisplayed = useAtomComponentSelectorValue(
    isRecordGroupTabsDisplayedComponentSelector,
  );

  const isRecordTableEmptyStateHidden = useAtomComponentStateValue(
    isRecordTableEmptyStateHiddenComponentState,
  );

  if (isRecordTableInitialLoading && !recordTableHasRecords) {
    return <RecordTableBodyLoading />;
  }

  // RecordTable keeps this body mounted for the tabs instead of showing its empty state
  if (
    isRecordGroupTabsDisplayed &&
    !recordTableHasRecords &&
    !isRecordTableEmptyStateHidden
  ) {
    return <RecordTableEmptyState />;
  }

  return (
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
  );
};
