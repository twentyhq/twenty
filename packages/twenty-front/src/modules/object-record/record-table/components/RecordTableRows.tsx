import { useRecoilValue } from 'recoil';

import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordTableRows = () => {
  const { tableRowIdsState } = useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  return tableRowIds.map((recordId, rowIndex) => {
    return (
      <RecordTableRow key={recordId} recordId={recordId} rowIndex={rowIndex} />
    );
  });
};
