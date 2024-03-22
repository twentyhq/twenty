import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

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
