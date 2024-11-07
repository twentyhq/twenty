import { RecordGroupContextProvider } from '@/object-record/record-group/components/RecordGroupContextProvider';
import { RecordTableRows } from '@/object-record/record-table/components/RecordTableRows';
import { RecordTableBodyDragDropContext } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContext';
import { RecordTableBodyDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTablePendingRow } from '@/object-record/record-table/record-table-row/components/RecordTablePendingRow';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { tableAllRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/tableAllRowIdsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

type RecordTableBodyProps = {
  objectMetadataNameSingular: string;
};

export const RecordTableBody = ({
  objectMetadataNameSingular,
}: RecordTableBodyProps) => {
  const tableRowIds = useRecoilComponentValueV2(
    tableAllRowIdsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
  );

  if (isRecordTableInitialLoading && tableRowIds.length === 0) {
    return <RecordTableBodyLoading />;
  }

  return (
    <RecordTableBodyDragDropContext>
      <RecordTableBodyDroppable>
        <RecordTablePendingRow />
        <RecordGroupContextProvider
          objectMetadataNameSingular={objectMetadataNameSingular}
        >
          <RecordTableRows />
        </RecordGroupContextProvider>
      </RecordTableBodyDroppable>
    </RecordTableBodyDragDropContext>
  );
};
