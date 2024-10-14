import React, { createContext } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { HandleContainerMouseEnterArgs } from '@/object-record/record-table/hooks/internal/useHandleContainerMouseEnter';
import { OpenTableCellArgs } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type RecordTableContextProps = {
  viewBarId: string;
  objectMetadataItem: ObjectMetadataItem;
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
  visibleTableColumns: ColumnDefinition<FieldMetadata>[];
  recordTableId: string;
  objectNameSingular: string;
};

export const RecordTableContext = createContext<RecordTableContextProps>(
  {} as RecordTableContextProps,
);
