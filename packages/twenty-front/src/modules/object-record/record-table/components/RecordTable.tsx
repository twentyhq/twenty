import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableBody } from '@/object-record/record-table/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/components/RecordTableBodyEffect';
import { RecordTableHeader } from '@/object-record/record-table/components/RecordTableHeader';
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
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

const StyledTable = styled.table<{
  freezeFirstColumns?: boolean;
  freezeFirstRow?: boolean;
}>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;

  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);
`;

type RecordTableProps = {
  recordTableId: string;
  objectNameSingular: string;
  onColumnsChange: (columns: any) => void;
  createRecord: () => void;
};

export const RecordTable = ({
  recordTableId,
  objectNameSingular,
  onColumnsChange,
  createRecord,
}: RecordTableProps) => {
  const { scopeId, visibleTableColumnsSelector } =
    useRecordTableStates(recordTableId);

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
    <RecordTableScope
      recordTableScopeId={scopeId}
      onColumnsChange={onColumnsChange}
    >
      {!!objectNameSingular && (
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
          }}
        >
          <StyledTable className="entity-table-cell">
            <RecordTableHeader createRecord={createRecord} />
            <RecordTableBodyEffect objectNameSingular={objectNameSingular} />
            <RecordTableBody
              objectNameSingular={objectNameSingular}
              recordTableId={recordTableId}
            />
          </StyledTable>
        </RecordTableContext.Provider>
      )}
    </RecordTableScope>
  );
};
