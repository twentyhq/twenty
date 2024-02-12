import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

export const RecordTableActionBar = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { getSelectedRowIdsSelector } = useRecordTableStates(recordTableId);

  const selectedRowIds = useRecoilValue(getSelectedRowIdsSelector());

  if (!selectedRowIds.length) {
    return null;
  }

  return <ActionBar />;
};
