import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableRows = () => {
  const tableRowIds = useRecoilComponentValueV2(tableRowIdsComponentState);

  return (
    <>
      {tableRowIds.map((recordId, rowIndex) => {
        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndex={rowIndex}
          />
        );
      })}
      <RecordTableBodyFetchMoreLoader />
    </>
  );
};
