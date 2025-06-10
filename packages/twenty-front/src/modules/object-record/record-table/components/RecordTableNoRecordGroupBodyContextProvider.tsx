import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useHandleContainerMouseEnter } from '@/object-record/record-table/hooks/internal/useHandleContainerMouseEnter';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useCloseRecordTableCellNoGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellNoGroup';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import {
  OpenTableCellArgs,
  useOpenRecordTableCellV2,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useTriggerActionMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerActionMenuDropdown';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { ReactNode } from 'react';

type RecordTableNoRecordGroupBodyContextProviderProps = {
  children?: ReactNode;
};

export const RecordTableNoRecordGroupBodyContextProvider = ({
  children,
}: RecordTableNoRecordGroupBodyContextProviderProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellV2(recordTableId);

  const handleOpenTableCell = (args: OpenTableCellArgs) => {
    openTableCell(args);
  };

  const { moveFocus } = useRecordTableMoveFocusedCell(recordTableId);

  const handleMoveFocus = (direction: MoveFocusDirection) => {
    moveFocus(direction);
  };

  const { closeTableCellNoGroup } = useCloseRecordTableCellNoGroup();

  const handleCloseTableCell = () => {
    closeTableCellNoGroup();
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

  const { handleContainerMouseEnter } = useHandleContainerMouseEnter({
    recordTableId,
  });

  return (
    <RecordTableBodyContextProvider
      value={{
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handleCloseTableCell,
        onMoveHoverToCurrentCell: handleMoveHoverToCurrentCell,
        onActionMenuDropdownOpened: handleActionMenuDropdown,
        onCellMouseEnter: handleContainerMouseEnter,
      }}
    >
      {children}
    </RecordTableBodyContextProvider>
  );
};
