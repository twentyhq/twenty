import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useCloseRecordTableCellInGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellInGroup';
import {
  type OpenTableCellArgs,
  useOpenRecordTableCell,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useTriggerCommandMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerCommandMenuDropdown';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
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

  const { triggerCommandMenuDropdown } = useTriggerCommandMenuDropdown({
    recordTableId,
  });

  const handleCommandMenuDropdown = (
    event: React.MouseEvent,
    recordId: string,
  ) => {
    triggerCommandMenuDropdown(event, recordId);
  };

  return (
    <RecordTableBodyContextProvider
      value={{
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handlecloseTableCellInGroup,
        onCommandMenuDropdownOpened: handleCommandMenuDropdown,
      }}
    >
      {children}
    </RecordTableBodyContextProvider>
  );
};
