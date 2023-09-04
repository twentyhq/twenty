import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconPlus } from '@/ui/icon';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { resizeFieldOffsetState } from '../states/resizeFieldOffsetState';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';

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

const StyledEntityTableColumnMenu = styled(EntityTableColumnMenu)`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export function EntityTableHeader() {
  const [offset, setOffset] = useRecoilState(resizeFieldOffsetState);
  const [columns, setColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const columnsByKey = useRecoilScopedValue(
    tableColumnsByKeyScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const visibleColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldKey, setResizedFieldKey] = useState<string | null>(null);
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
        if (!resizedFieldKey) return;

        const nextWidth = Math.round(
          Math.max(
            columnsByKey[resizedFieldKey].size +
              snapshot.getLoadable(resizeFieldOffsetState).valueOrThrow(),
            COLUMN_MIN_WIDTH,
          ),
        );

        if (nextWidth !== columnsByKey[resizedFieldKey].size) {
          const nextColumns = columns.map((column) =>
            column.key === resizedFieldKey
              ? { ...column, size: nextWidth }
              : column,
          );

          setColumns(nextColumns);
        }

        set(resizeFieldOffsetState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldKey(null);
      },
    [resizedFieldKey, columnsByKey, columns, setColumns],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldKey !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });

  const toggleColumnMenu = useCallback(() => {
    setIsColumnMenuOpen((previousValue) => !previousValue);
  }, []);

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
            key={column.key}
            isResizing={resizedFieldKey === column.key}
            columnWidth={Math.max(
              columnsByKey[column.key].size +
                (resizedFieldKey === column.key ? offset : 0),
              COLUMN_MIN_WIDTH,
            )}
          >
            <ColumnHead viewName={column.name} viewIcon={column.icon} />
            <StyledResizeHandler
              className="cursor-col-resize"
              role="separator"
              onPointerDown={() => {
                setResizedFieldKey(column.key);
              }}
            />
          </StyledColumnHeaderCell>
        ))}
        <th>
          {hiddenColumns.length > 0 && (
            <StyledAddIconButtonWrapper>
              <IconButton
                size="medium"
                variant="tertiary"
                icon={<IconPlus />}
                onClick={toggleColumnMenu}
                position="middle"
              />
              {isColumnMenuOpen && (
                <StyledEntityTableColumnMenu
                  onAddColumn={toggleColumnMenu}
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
