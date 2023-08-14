import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { IconPlus } from '@/ui/icon';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';

import { resizeFieldOffsetState } from '../states/resizeFieldOffsetState';
import {
  hiddenTableColumnsState,
  tableColumnsByIdState,
  tableColumnsState,
  visibleTableColumnsState,
} from '../states/tableColumnsState';

import { ColumnHead } from './ColumnHead';
import { EntityTableColumnMenu } from './EntityTableColumnMenu';
import { SelectAllCheckbox } from './SelectAllCheckbox';

const COLUMN_MIN_WIDTH = 75;

const StyledColumnHeaderCell = styled.th<{
  columnWidth: number;
  isResizing?: boolean;
}>`
  ${({ columnWidth }) => `
    min-width: ${columnWidth}px;
    width: ${columnWidth}px;
  `}
  position: relative;
  user-select: none;
  ${({ isResizing, theme }) => {
    if (isResizing) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        top: 0;
        width: 2px;
      }`;
    }
  }};
`;

const StyledResizeHandler = styled.div`
  bottom: 0;
  cursor: col-resize;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: -9px;
  top: 0;
  width: 3px;
  z-index: 1;
`;

const StyledAddIconButtonWrapper = styled.div`
  display: inline-flex;
  position: relative;
`;

const StyledAddIconButton = styled(IconButton)`
  border-radius: 0;
`;

const StyledEntityTableColumnMenu = styled(EntityTableColumnMenu)`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export type EntityTableHeaderProps = {
  onColumnsChange?: (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => void;
};

export function EntityTableHeader({ onColumnsChange }: EntityTableHeaderProps) {
  const theme = useTheme();

  const [columns, setColumns] = useRecoilState(tableColumnsState);
  const [offset, setOffset] = useRecoilState(resizeFieldOffsetState);
  const columnsById = useRecoilValue(tableColumnsByIdState);
  const hiddenColumns = useRecoilValue(hiddenTableColumnsState);
  const visibleColumns = useRecoilValue(visibleTableColumnsState);

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldId, setResizedFieldId] = useState<string | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const handleResizeHandlerStart = useCallback((positionX: number) => {
    setInitialPointerPositionX(positionX);
  }, []);

  const handleResizeHandlerMove = useCallback(
    (positionX: number) => {
      if (!initialPointerPositionX) return;
      setOffset(positionX - initialPointerPositionX);
    },
    [setOffset, initialPointerPositionX],
  );

  const handleResizeHandlerEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        if (!resizedFieldId) return;

        const nextWidth = Math.round(
          Math.max(
            columnsById[resizedFieldId].columnSize +
              snapshot.getLoadable(resizeFieldOffsetState).valueOrThrow(),
            COLUMN_MIN_WIDTH,
          ),
        );

        if (nextWidth !== columnsById[resizedFieldId].columnSize) {
          const nextColumns = columns.map((column) =>
            column.id === resizedFieldId
              ? { ...column, columnSize: nextWidth }
              : column,
          );

          setColumns(nextColumns);
          onColumnsChange?.(nextColumns);
        }

        set(resizeFieldOffsetState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldId(null);
      },
    [resizedFieldId, columnsById, setResizedFieldId],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });

  const toggleColumnMenu = useCallback(() => {
    setIsColumnMenuOpen((previousValue) => !previousValue);
  }, []);

  const handleAddColumn = useCallback(
    (columnId: string) => {
      setIsColumnMenuOpen(false);

      const nextColumns = columns.map((column) =>
        column.id === columnId ? { ...column, isVisible: true } : column,
      );

      setColumns(nextColumns);
      onColumnsChange?.(nextColumns);
    },
    [columns, onColumnsChange, setColumns],
  );

  return (
    <thead data-select-disable>
      <tr>
        <th
          style={{
            width: 30,
            minWidth: 30,
            maxWidth: 30,
          }}
        >
          <SelectAllCheckbox />
        </th>

        {visibleColumns.map((column) => (
          <StyledColumnHeaderCell
            key={column.id}
            isResizing={resizedFieldId === column.id}
            columnWidth={Math.max(
              columnsById[column.id].columnSize +
                (resizedFieldId === column.id ? offset : 0),
              COLUMN_MIN_WIDTH,
            )}
          >
            <ColumnHead
              viewName={column.columnLabel}
              viewIcon={column.columnIcon}
            />
            <StyledResizeHandler
              className="cursor-col-resize"
              role="separator"
              onPointerDown={() => {
                setResizedFieldId(column.id);
              }}
            />
          </StyledColumnHeaderCell>
        ))}
        <th>
          {hiddenColumns.length > 0 && (
            <StyledAddIconButtonWrapper>
              <StyledAddIconButton
                size="large"
                icon={<IconPlus size={theme.icon.size.md} />}
                onClick={toggleColumnMenu}
              />
              {isColumnMenuOpen && (
                <StyledEntityTableColumnMenu
                  onAddColumn={handleAddColumn}
                  onClickOutside={toggleColumnMenu}
                />
              )}
            </StyledAddIconButtonWrapper>
          )}
        </th>
      </tr>
    </thead>
  );
}
