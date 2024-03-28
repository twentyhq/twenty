import { useRecoilValue } from 'recoil';
import { ContextMenu } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordTableContextMenu = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { selectedRowIdsSelector } = useRecordTableStates(recordTableId);

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  if (!selectedRowIds.length) {
    return null;
  }

  return <ContextMenu />;
};
