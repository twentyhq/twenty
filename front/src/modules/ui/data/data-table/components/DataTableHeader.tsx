import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { IconPlus } from '@/ui/display/icon';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { resizeFieldOffsetState } from '../states/resizeFieldOffsetState';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';

import { ColumnHeadWithDropdown } from './ColumnHeadWithDropdown';
import { DataTableHeaderPlusButtonContent } from './DataTableHeaderPlusButtonContent';
import { SelectAllCheckbox } from './SelectAllCheckbox';

const COLUMN_MIN_WIDTH = 104;

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

const StyledTableHead = styled.thead`
  cursor: pointer;
`;

const StyledColumnHeadContainer = styled.div`
  position: relative;
  z-index: 1;
`;

const HIDDEN_TABLE_COLUMN_DROPDOWN_SCOPE_ID =
  'hidden-table-columns-dropdown-scope-id';

const HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID =
  'hidden-table-columns-dropdown-hotkey-scope-id';

export const DataTableHeader = () => {
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
            column.fieldId === resizedFieldKey
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

  const primaryColumn = visibleTableColumns.find(
    (column) => column.position === 0,
  );

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
        {[...visibleTableColumns]
          .sort((columnA, columnB) => columnA.position - columnB.position)
          .map((column) => (
            <StyledColumnHeaderCell
              key={column.fieldId}
              isResizing={resizedFieldKey === column.fieldId}
              columnWidth={Math.max(
                tableColumnsByKey[column.fieldId].size +
                  (resizedFieldKey === column.fieldId ? resizeFieldOffset : 0),
                COLUMN_MIN_WIDTH,
              )}
            >
              <StyledColumnHeadContainer>
                <ColumnHeadWithDropdown
                  column={column}
                  isFirstColumn={column.position === 1}
                  isLastColumn={
                    column.position === visibleTableColumns.length - 1
                  }
                  primaryColumnKey={primaryColumn?.fieldId || ''}
                />
              </StyledColumnHeadContainer>
              <StyledResizeHandler
                className="cursor-col-resize"
                role="separator"
                onPointerDown={() => {
                  setResizedFieldKey(column.fieldId);
                }}
              />
            </StyledColumnHeaderCell>
          ))}
        <th>
          {hiddenTableColumns.length > 0 && (
            <StyledColumnHeadContainer>
              <DropdownScope
                dropdownScopeId={HIDDEN_TABLE_COLUMN_DROPDOWN_SCOPE_ID}
              >
                <Dropdown
                  clickableComponent={
                    <IconButton
                      size="medium"
                      variant="tertiary"
                      Icon={IconPlus}
                      position="middle"
                    />
                  }
                  dropdownComponents={<DataTableHeaderPlusButtonContent />}
                  dropdownPlacement="bottom-start"
                  dropdownHotkeyScope={{
                    scope: HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID,
                  }}
                />
              </DropdownScope>
            </StyledColumnHeadContainer>
          )}
        </th>
      </tr>
    </StyledTableHead>
  );
};
