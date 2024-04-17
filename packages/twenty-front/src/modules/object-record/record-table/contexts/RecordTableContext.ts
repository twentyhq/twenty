import { createContext } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OpenTableCellArgs } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';

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
};

export const RecordTableContext = createContext<RecordTableContextProps>(
  {} as RecordTableContextProps,
);
