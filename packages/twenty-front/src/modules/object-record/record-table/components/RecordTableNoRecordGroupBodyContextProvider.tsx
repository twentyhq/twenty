import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useCloseRecordTableCellNoGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellNoGroup';
import {
  type OpenTableCellArgs,
  useOpenRecordTableCell,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useTriggerCommandMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerCommandMenuDropdown';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

  const { triggerCommandMenuDropdown } = useTriggerCommandMenuDropdown({
    recordTableId,
  });

  const handleCommandMenuDropdown = (
    event: React.MouseEvent,
    recordId: string,
  ) => {
    triggerCommandMenuDropdown(event, recordId);
  };

  const hasUserSelectedAllRows = useAtomComponentStateValue(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  return (
    <RecordTableBodyContextProvider
      value={{
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handleCloseTableCell,
        onCommandMenuDropdownOpened: handleCommandMenuDropdown,
        hasUserSelectedAllRows,
      }}
    >
      {children}
    </RecordTableBodyContextProvider>
  );
};
