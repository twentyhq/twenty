import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useCloseRecordTableCellInGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellInGroup';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import {
  type OpenTableCellArgs,
  useOpenRecordTableCell,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useTriggerActionMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerActionMenuDropdown';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { type ReactNode } from 'react';

type RecordTableRecordGroupBodyContextProviderProps = {
  recordGroupId: string;
  children?: ReactNode;
};

export const RecordTableRecordGroupBodyContextProvider = ({
  children,
}: RecordTableRecordGroupBodyContextProviderProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { openTableCell } = useOpenRecordTableCell(recordTableId);

  const handleOpenTableCell = (args: OpenTableCellArgs) => {
    openTableCell(args);
  };

  const { moveFocus } = useRecordTableMoveFocusedCell(recordTableId);

  const handleMoveFocus = (direction: MoveFocusDirection) => {
    moveFocus(direction);
  };

  const { closeTableCellInGroup } = useCloseRecordTableCellInGroup();

  const handlecloseTableCellInGroup = () => {
    closeTableCellInGroup();
  };

  const { moveHoverToCurrentCell } = useMoveHoverToCurrentCell(recordTableId);

  const handleMoveHoverToCurrentCell = (cellPosition: TableCellPosition) => {
    moveHoverToCurrentCell(cellPosition);
  };

  const { triggerActionMenuDropdown } = useTriggerActionMenuDropdown({
    recordTableId,
  });

  const handleActionMenuDropdown = (
    event: React.MouseEvent,
    recordId: string,
  ) => {
    triggerActionMenuDropdown(event, recordId);
  };

  return (
    <RecordTableBodyContextProvider
      value={{
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handlecloseTableCellInGroup,
        onMoveHoverToCurrentCell: handleMoveHoverToCurrentCell,
        onActionMenuDropdownOpened: handleActionMenuDropdown,
      }}
    >
      {children}
    </RecordTableBodyContextProvider>
  );
};
