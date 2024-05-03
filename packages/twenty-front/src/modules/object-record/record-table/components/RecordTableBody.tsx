import { useRecoilValue } from 'recoil';

import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTablePendingRow } from '@/object-record/record-table/components/RecordTablePendingRow';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

type RecordTableBodyProps = {
  objectNameSingular: string;
};

export const RecordTableBody = ({
  objectNameSingular,
}: RecordTableBodyProps) => {
  const { tableRowIdsState } = useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  // TODO: don't show table row if still loading ?

  return (
    <>
      <tbody>
        <RecordTablePendingRow />
        {tableRowIds.map((recordId, rowIndex) => (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndex={rowIndex}
          />
        ))}
      </tbody>
      <RecordTableBodyFetchMoreLoader objectNameSingular={objectNameSingular} />
    </>
  );
};
