import { RecordTableBodyContextValueProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useCloseRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCell';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ReactNode } from 'react';

type RecordTableBodyContextProviderProps = {
  children?: ReactNode;
};

export const RecordTableBodyContextProvider = ({
  children,
}: RecordTableBodyContextProviderProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { openTableCell } = useOpenRecordTableCell(recordTableId);
  const { moveFocus } = useRecordTableMoveFocusedCell(recordTableId);
  const { closeTableCell } = useCloseRecordTableCell();
  const { moveHoverToCurrentCell } = useMoveHoverToCurrentCell(recordTableId);
  const { openRecordContextMenu } = useOpenRecordContextMenu();

  const hasUserSelectedAllRecords = useAtomComponentStateValue(
    hasUserSelectedAllRecordsComponentState,
    recordTableId,
  );

  return (
    <RecordTableBodyContextValueProvider
      value={{
        onOpenTableCell: openTableCell,
        onMoveFocus: moveFocus,
        onCloseTableCell: closeTableCell,
        onMoveHoverToCurrentCell: moveHoverToCurrentCell,
        openRecordContextMenu,
        hasUserSelectedAllRecords,
      }}
    >
      {children}
    </RecordTableBodyContextValueProvider>
  );
};
