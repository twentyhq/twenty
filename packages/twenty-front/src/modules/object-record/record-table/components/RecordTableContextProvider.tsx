import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useHandleContainerMouseEnter } from '@/object-record/record-table/hooks/internal/useHandleContainerMouseEnter';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTableMoveFocus } from '@/object-record/record-table/hooks/useRecordTableMoveFocus';
import { useCloseRecordTableCellV2 } from '@/object-record/record-table/record-table-cell/hooks/useCloseRecordTableCellV2';
import { useMoveSoftFocusToCellOnHoverV2 } from '@/object-record/record-table/record-table-cell/hooks/useMoveSoftFocusToCellOnHoverV2';
import {
  OpenTableCellArgs,
  useOpenRecordTableCellV2,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useTriggerContextMenu } from '@/object-record/record-table/record-table-cell/hooks/useTriggerContextMenu';
import { useUpsertRecordV2 } from '@/object-record/record-table/record-table-cell/hooks/useUpsertRecordV2';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const RecordTableContextProvider = ({
  recordTableId,
  objectNameSingular,
  children,
}: {
  recordTableId: string;
  objectNameSingular: string;
  children: ReactNode;
}) => {
  const { visibleTableColumnsSelector } = useRecordTableStates(recordTableId);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { upsertRecord } = useUpsertRecordV2({
    objectNameSingular,
  });

  const handleUpsertRecord = ({
    persistField,
    entityId,
    fieldName,
  }: {
    persistField: () => void;
    entityId: string;
    fieldName: string;
  }) => {
    upsertRecord(persistField, entityId, fieldName, recordTableId);
  };

  const { openTableCell } = useOpenRecordTableCellV2(recordTableId);

  const handleOpenTableCell = (args: OpenTableCellArgs) => {
    openTableCell(args);
  };

  const { moveFocus } = useRecordTableMoveFocus(recordTableId);

  const handleMoveFocus = (direction: MoveFocusDirection) => {
    moveFocus(direction);
  };

  const { closeTableCell } = useCloseRecordTableCellV2(recordTableId);

  const handleCloseTableCell = () => {
    closeTableCell();
  };

  const { moveSoftFocusToCell } =
    useMoveSoftFocusToCellOnHoverV2(recordTableId);

  const handleMoveSoftFocusToCell = (cellPosition: TableCellPosition) => {
    moveSoftFocusToCell(cellPosition);
  };

  const { triggerContextMenu } = useTriggerContextMenu({
    recordTableId,
  });

  const handleContextMenu = (event: React.MouseEvent, recordId: string) => {
    triggerContextMenu(event, recordId);
  };

  const { handleContainerMouseEnter } = useHandleContainerMouseEnter({
    recordTableId,
  });

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return (
    <RecordTableContext.Provider
      value={{
        objectMetadataItem,
        onUpsertRecord: handleUpsertRecord,
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handleCloseTableCell,
        onMoveSoftFocusToCell: handleMoveSoftFocusToCell,
        onContextMenu: handleContextMenu,
        onCellMouseEnter: handleContainerMouseEnter,
        visibleTableColumns,
        recordTableId,
        objectNameSingular,
      }}
    >
      {children}
    </RecordTableContext.Provider>
  );
};
