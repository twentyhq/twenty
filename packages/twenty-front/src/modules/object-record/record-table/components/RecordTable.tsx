import { useRef } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { RGBA } from 'twenty-ui';

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
import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';
import { isRecordTableScrolledTopState } from '@/object-record/record-table/states/isRecordTableScrolledTopState';
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

  &.freeze-first-columns thead th:nth-of-type(3)::after,
  &.freeze-first-columns tbody td:nth-of-type(3)::after {
    content: '';
    height: calc(100% + 1px);
    position: absolute;
    width: 4px;
    right: -4px;
    top: 0;
    border-right: none;

    ${({ theme }) => css`
      box-shadow: 4px 0px 4px -4px ${theme.name === 'dark'
          ? RGBA(theme.grayScale.gray50, 0.8)
          : RGBA(theme.grayScale.gray100, 0.25)} inset;
    `}
  }

  &.freeze-first-row th::after {
    content: '';
    width: calc(100%);
    position: absolute;
    height: 4px;
    bottom: -4px;
    left: 0;
    z-index: 0;

    ${({ theme }) => css`
      box-shadow: 0px 4px 4px -4px ${theme.name === 'dark'
          ? RGBA(theme.grayScale.gray50, 0.8)
          : RGBA(theme.grayScale.gray100, 0.25)} inset;
    `}
  }

  &.freeze-first-row.freeze-first-columns th:nth-of-type(3)::after {
    content: '';
    width: calc(100%);
    position: absolute;
    height: 4px;
    bottom: -4px;
    left: 0;
    z-index: 0;

    right: auto;
    top: auto;

    ${({ theme }) => css`
      box-shadow: 0px 4px 4px -4px ${theme.name === 'dark'
          ? RGBA(theme.grayScale.gray50, 0.8)
          : RGBA(theme.grayScale.gray100, 0.25)} inset;
    `}
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
  const tableRef = useRef<HTMLTableElement>(null);
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

  // const scrollWrapper = useContext(ScrollWrapperContext);

  // const handleScroll = useDebouncedCallback(
  //   useCallback(() => {
  //     const styledTableElement = tableRef.current;

  //     const scrollWrapperElement = scrollWrapper.current;

  //     const currentScrollLeft =
  //       scrollWrapperElement?.children.item(1)?.scrollLeft ?? 0;
  //     const currentScrollTop =
  //       scrollWrapperElement?.children.item(1)?.scrollTop ?? 0;

  //     if (currentScrollLeft > 0) {
  //       styledTableElement?.classList.add('freeze-first-columns');
  //     } else {
  //       styledTableElement?.classList.remove('freeze-first-columns');
  //     }

  //     if (currentScrollTop > 0) {
  //       styledTableElement?.classList.add('freeze-first-row');
  //     } else {
  //       styledTableElement?.classList.remove('freeze-first-row');
  //     }
  //   }, [scrollWrapper]),
  //   0,
  //   {
  //     leading: true,
  //   },
  // );

  // useLayoutEffect(() => {
  //   const scrollWrapperElement = scrollWrapper.current;

  //   scrollWrapperElement?.addEventListener('wheel', handleScroll, {
  //     capture: true,
  //     passive: true,
  //   });
  //   scrollWrapperElement?.addEventListener('scroll', handleScroll, {
  //     capture: true,
  //     passive: true,
  //   });

  //   // scrollWrapperElement?.addEventListener('touchmove', handleScroll, {
  //   //   capture: true,
  //   //   passive: true,
  //   // });

  //   return () => {
  //     scrollWrapperElement?.removeEventListener('wheel', handleScroll);
  //     scrollWrapperElement?.removeEventListener('scroll', handleScroll);
  //   };
  // }, [scrollWrapper, handleScroll]);

  const isRecordTableScrolledTop = useRecoilValue(
    isRecordTableScrolledTopState,
  );

  const isRecordTableScrolledLeft = useRecoilValue(
    isRecordTableScrolledLeftState,
  );

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
          <StyledTable
            ref={tableRef}
            className="entity-table-cell"
            freezeFirstColumns={!isRecordTableScrolledLeft}
            freezeFirstRow={!isRecordTableScrolledTop}
          >
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
