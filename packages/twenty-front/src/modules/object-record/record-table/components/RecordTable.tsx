import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT, RGBA } from 'twenty-ui';

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
}>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;

  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);

  th {
    border-block: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.tertiary};
    padding: 0;
    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-top-color: transparent;
      border-bottom-color: transparent;
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};

    padding: 0;

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-top-color: transparent;
      border-bottom-color: transparent;
    }
  }

  th {
    background-color: ${({ theme }) => theme.background.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 9;
  }

  thead th:nth-of-type(1),
  thead th:nth-of-type(2),
  thead th:nth-of-type(3) {
    z-index: 12;
    background-color: ${({ theme }) => theme.background.primary};
  }

  thead th:nth-of-type(1) {
    width: 9px;
    left: 0;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  thead th:nth-of-type(2) {
    left: 9px;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  thead th:nth-of-type(3) {
    left: 39px;
  }

  tbody td:nth-of-type(1),
  tbody td:nth-of-type(2),
  tbody td:nth-of-type(3) {
    position: sticky;
    z-index: 1;
  }

  tbody td:nth-of-type(1) {
    left: 0;
    z-index: 7;
  }

  tbody td:nth-of-type(2) {
    left: 9px;
    z-index: 5;
  }

  tbody td:nth-of-type(3) {
    left: 39px;
    z-index: 6;
  }

  thead th:nth-of-type(3),
  tbody td:nth-of-type(3) {
    ${({ freezeFirstColumns }) =>
      freezeFirstColumns &&
      css`
        @media (max-width: ${MOBILE_VIEWPORT}px) {
          width: 35px;
          max-width: 35px;
        }
      `}

    &::after {
      content: '';
      height: calc(100% + 1px);
      position: absolute;
      width: 4px;
      right: -4px;
      top: 0;

      ${({ freezeFirstColumns, theme }) =>
        freezeFirstColumns &&
        css`
          box-shadow: 4px 0px 4px -4px ${theme.name === 'dark'
              ? RGBA(theme.grayScale.gray50, 0.8)
              : RGBA(theme.grayScale.gray100, 0.25)} inset;
        `}
    }
  }
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
