import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

export const RecordTableContextMenu = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { getSelectedRowIdsSelector } = useRecordTableStates(recordTableId);

  const selectedRowIds = useRecoilValue(getSelectedRowIdsSelector());

  if (!selectedRowIds.length) {
    return null;
  }

  return <ContextMenu />;
};
