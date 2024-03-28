import { useRecoilValue } from 'recoil';
import { ActionBar } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordTableActionBar = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { selectedRowIdsSelector } = useRecordTableStates(recordTableId);

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  if (!selectedRowIds.length) {
    return null;
  }

  return <ActionBar />;
};
