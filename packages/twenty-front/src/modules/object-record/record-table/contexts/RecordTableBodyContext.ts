import React from 'react';

import { HandleContainerMouseEnterArgs } from '@/object-record/record-table/hooks/internal/useHandleContainerMouseEnter';
import { OpenTableCellArgs } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableBodyContextProps = {
  recordGroupId?: string;
  onUpsertRecord: ({
    persistField,
    recordId,
    fieldName,
  }: {
    persistField: () => void;
    recordId: string;
    fieldName: string;
  }) => void;
  onOpenTableCell: (args: OpenTableCellArgs) => void;
  onMoveFocus: (direction: MoveFocusDirection) => void;
  onCloseTableCell: () => void;
  onMoveSoftFocusToCell: (cellPosition: TableCellPosition) => void;
  onActionMenuDropdownOpened: (
    event: React.MouseEvent,
    recordId: string,
  ) => void;
  onCellMouseEnter: (args: HandleContainerMouseEnterArgs) => void;
};

export const [
  RecordTableBodyContextProvider,
  useRecordTableBodyContextOrThrow,
] = createRequiredContext<RecordTableBodyContextProps>(
  'RecordTableBodyContext',
);
