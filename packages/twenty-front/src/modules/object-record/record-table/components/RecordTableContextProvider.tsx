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
import { useTriggerActionMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerActionMenuDropdown';
import { useUpsertRecord } from '@/object-record/record-table/record-table-cell/hooks/useUpsertRecord';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const RecordTableContextProvider = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  children,
}: {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  children: ReactNode;
}) => {
  const { visibleTableColumnsSelector } = useRecordTableStates(recordTableId);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { upsertRecord } = useUpsertRecord({
    objectNameSingular,
  });

  const handleUpsertRecord = ({
    persistField,
    recordId,
    fieldName,
  }: {
    persistField: () => void;
    recordId: string;
    fieldName: string;
  }) => {
    upsertRecord(persistField, recordId, fieldName, recordTableId);
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

  const { triggerActionMenuDropdown } = useTriggerActionMenuDropdown({
    recordTableId,
  });

  const handleActionMenuDropdown = (
    event: React.MouseEvent,
    recordId: string,
  ) => {
    triggerActionMenuDropdown(event, recordId);
  };

  const { handleContainerMouseEnter } = useHandleContainerMouseEnter({
    recordTableId,
  });

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return (
    <RecordTableContext.Provider
      value={{
        viewBarId,
        objectMetadataItem,
        onUpsertRecord: handleUpsertRecord,
        onOpenTableCell: handleOpenTableCell,
        onMoveFocus: handleMoveFocus,
        onCloseTableCell: handleCloseTableCell,
        onMoveSoftFocusToCell: handleMoveSoftFocusToCell,
        onActionMenuDropdownOpened: handleActionMenuDropdown,
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
