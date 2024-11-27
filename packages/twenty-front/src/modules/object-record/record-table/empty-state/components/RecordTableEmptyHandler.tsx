import { isNull } from '@sniptt/guards';

import { recordIndexAllRowIdsComponentState } from '@/object-record/record-index/states/recordIndexAllRowIdsComponentState';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
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

  const allRowIds = useRecoilComponentValueV2(
    recordIndexAllRowIdsComponentState,
    recordTableId,
  );

  const pendingRecordId = useRecoilComponentValueV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    allRowIds.length === 0 &&
    isNull(pendingRecordId);

  if (recordTableIsEmpty) {
    return <RecordTableEmptyState />;
  }

  return children;
};
