import { createContext } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { HandleContainerMouseEnterArgs } from '@/object-record/record-table/hooks/internal/useHandleContainerMouseEnter';
import { OpenTableCellArgs } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

type RecordTableContextProps = {
  objectMetadataItem: ObjectMetadataItem;
  onUpsertRecord: ({
    persistField,
    entityId,
    fieldName,
  }: {
    persistField: () => void;
    entityId: string;
    fieldName: string;
  }) => void;
  onOpenTableCell: (args: OpenTableCellArgs) => void;
  onMoveFocus: (direction: MoveFocusDirection) => void;
  onCloseTableCell: () => void;
  onMoveSoftFocusToCell: (cellPosition: TableCellPosition) => void;
  onContextMenu: (event: React.MouseEvent, recordId: string) => void;
  onCellMouseEnter: (args: HandleContainerMouseEnterArgs) => void;
};

export const RecordTableContext = createContext<RecordTableContextProps>(
  {} as RecordTableContextProps,
);
