import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

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

  return <ActionBar selectedIds={selectedRowIds} />;
};
