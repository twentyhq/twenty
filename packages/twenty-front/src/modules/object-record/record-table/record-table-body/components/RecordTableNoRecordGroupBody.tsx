import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableNoRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableNoRecordGroupBodyContextProvider';
import { RecordTableNoRecordGroupRows } from '@/object-record/record-table/components/RecordTableNoRecordGroupRows';
import { RecordTableBodyDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContextProvider';
import { RecordTableBodyDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableNoRecordGroupBody = () => {
  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
  );

  if (isRecordTableInitialLoading && allRecordIds.length === 0) {
    return <RecordTableBodyLoading />;
  }

  return (
    <RecordTableNoRecordGroupBodyContextProvider>
      <RecordTableBodyDragDropContextProvider>
        <RecordTableBodyDroppable>
          <RecordTableNoRecordGroupRows />
          <RecordTableCellPortals />
        </RecordTableBodyDroppable>
      </RecordTableBodyDragDropContextProvider>
    </RecordTableNoRecordGroupBodyContextProvider>
  );
};
