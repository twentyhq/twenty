import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useCloseRecordTableCellNoGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellNoGroup';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import {
  type OpenTableCellArgs,
  useOpenRecordTableCell,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useTriggerActionMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerActionMenuDropdown';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type ReactNode } from 'react';

type RecordTableNoRecordGroupBodyContextProviderProps = {
  children?: ReactNode;
};

export const RecordTableNoRecordGroupBodyContextProvider = ({
  children,
}: RecordTableNoRecordGroupBodyContextProviderProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { openTableCell } = useOpenRecordTableCell(recordTableId);

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

  const hasUserSelectedAllRows = useRecoilComponentValue(
    hasUserSelectedAllRowsComponentState,
  );

  return (
    <RecordTableBodyContextProvider
      value={{
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handleCloseTableCell,
        onMoveHoverToCurrentCell: handleMoveHoverToCurrentCell,
        onActionMenuDropdownOpened: handleActionMenuDropdown,
        hasUserSelectedAllRows,
      }}
    >
      {children}
    </RecordTableBodyContextProvider>
  );
};
