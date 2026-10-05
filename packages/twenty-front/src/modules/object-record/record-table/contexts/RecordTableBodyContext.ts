import { type OpenTableCellArgs } from '@/object-record/record-table/types/OpenTableCellArgs';
import { type CommandMenuDropdownTriggerEvent } from '@/command-menu-item/hooks/useOpenCommandMenuDropdownAtCursor';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableBodyContextProps = {
  onOpenTableCell: (args: OpenTableCellArgs) => void;
  onMoveFocus: (direction: MoveFocusDirection) => void;
  onCloseTableCell: () => void;
  onMoveHoverToCurrentCell: (cellPosition: TableCellPosition) => void;
  openRecordContextMenu: (args: {
    event: CommandMenuDropdownTriggerEvent;
    recordId: string;
  }) => void;
  hasUserSelectedAllRecords?: boolean;
};

export const [
  RecordTableBodyContextValueProvider,
  useRecordTableBodyContextOrThrow,
] = createRequiredContext<RecordTableBodyContextProps>(
  'RecordTableBodyContext',
);
