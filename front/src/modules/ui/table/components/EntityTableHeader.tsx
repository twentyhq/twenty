import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconPlus } from '@/ui/icon';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
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

const StyledTableHead = styled.thead`
  cursor: pointer;
`;

export const EntityTableHeader = () => {
  const [resizeFieldOffset, setResizeFieldOffset] = useRecoilState(
    resizeFieldOffsetState,
  );
  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const tableColumnsByKey = useRecoilScopedValue(
    tableColumnsByKeyScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldKey, setResizedFieldKey] = useState<string | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const { handleColumnsChange } = useTableColumns();

  const handleResizeHandlerStart = useCallback((positionX: number) => {
    setInitialPointerPositionX(positionX);
  }, []);

  const handleResizeHandlerMove = useCallback(
    (positionX: number) => {
      if (!initialPointerPositionX) return;
      setResizeFieldOffset(positionX - initialPointerPositionX);
    },
    [setResizeFieldOffset, initialPointerPositionX],
  );

  const handleResizeHandlerEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        if (!resizedFieldKey) return;

        const nextWidth = Math.round(
          Math.max(
            tableColumnsByKey[resizedFieldKey].size +
              snapshot.getLoadable(resizeFieldOffsetState).valueOrThrow(),
            COLUMN_MIN_WIDTH,
          ),
        );

        set(resizeFieldOffsetState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldKey(null);

        if (nextWidth !== tableColumnsByKey[resizedFieldKey].size) {
          const nextColumns = tableColumns.map((column) =>
            column.key === resizedFieldKey
              ? { ...column, size: nextWidth }
              : column,
          );

          await handleColumnsChange(nextColumns);
        }
      },
    [resizedFieldKey, tableColumnsByKey, tableColumns, handleColumnsChange],
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

  const primaryColumn = visibleTableColumns[0];

  return (
    <StyledTableHead data-select-disable>
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
        <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
          {visibleTableColumns.map((column, index) => (
            <StyledColumnHeaderCell
              key={column.key}
              isResizing={resizedFieldKey === column.key}
              columnWidth={Math.max(
                tableColumnsByKey[column.key].size +
                  (resizedFieldKey === column.key ? resizeFieldOffset : 0),
                COLUMN_MIN_WIDTH,
              )}
            >
              <ColumnHead
                column={column}
                isFirstColumn={index === 1}
                isLastColumn={index === visibleTableColumns.length - 1}
                primaryColumnKey={primaryColumn.key}
              />

              <StyledResizeHandler
                className="cursor-col-resize"
                role="separator"
                onPointerDown={() => {
                  setResizedFieldKey(column.key);
                }}
              />
            </StyledColumnHeaderCell>
          ))}
        </RecoilScope>

        <th>
          {hiddenTableColumns.length > 0 && (
            <StyledAddIconButtonWrapper>
              <IconButton
                size="medium"
                variant="tertiary"
                Icon={IconPlus}
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
    </StyledTableHead>
  );
};
