import type React from 'react';

import { type OpenTableCellArgs } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableBodyContextProps = {
  recordGroupId?: string;
  onOpenTableCell: (args: OpenTableCellArgs) => void;
  onMoveFocus: (direction: MoveFocusDirection) => void;
  onCloseTableCell: () => void;
  onCommandMenuDropdownOpened: (
    event: React.MouseEvent,
    recordId: string,
  ) => void;
  hasUserSelectedAllRows?: boolean;
};

export const [
  RecordTableBodyContextProvider,
  useRecordTableBodyContextOrThrow,
] = createRequiredContext<RecordTableBodyContextProps>(
  'RecordTableBodyContext',
);
