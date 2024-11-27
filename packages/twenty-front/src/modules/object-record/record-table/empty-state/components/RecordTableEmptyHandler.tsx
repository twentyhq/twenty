import { isNull } from '@sniptt/guards';

import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

type RecordTableEmptyHandlerProps = {
  recordTableId: string;
  children: React.ReactNode;
};

export const RecordTableEmptyHandler = ({
  recordTableId,
  children,
}: RecordTableEmptyHandlerProps) => {
  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const tableRowIds = useRecoilComponentValueV2(
    tableAllRowIdsComponentState,
    recordTableId,
  );

  const pendingRecordId = useRecoilComponentValueV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    tableRowIds.length === 0 &&
    isNull(pendingRecordId);

  if (recordTableIsEmpty) {
    return <RecordTableEmptyState />;
  }

  return children;
};
