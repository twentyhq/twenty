import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { IconPlus } from '@/ui/display/icon';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';

import { useRecordTableScopedStates } from '../hooks/internal/useRecordTableScopedStates';
import { useTableColumns } from '../hooks/useTableColumns';
import { resizeFieldOffsetState } from '../states/resizeFieldOffsetState';

import { ColumnHeadWithDropdown } from './ColumnHeadWithDropdown';
import { RecordTableHeaderPlusButtonContent } from './RecordTableHeaderPlusButtonContent';
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
  ${({ theme }) => {
    return `
    &:hover {
      background: ${theme.background.transparent.light};
    };
    `;
  }};
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

const StyledPlusIconHeaderCell = styled.th`
  ${({ theme }) => {
    return `
  &:hover {
    background: ${theme.background.transparent.light};
  };
  padding-left: ${theme.spacing(3)};
  `;
  }};
  border-bottom: none !important;
  border-left: none !important;
  min-width: 32px;
  position: relative;
  z-index: 1;
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const HIDDEN_TABLE_COLUMN_DROPDOWN_SCOPE_ID =
  'hidden-table-columns-dropdown-scope-id';

const HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID =
  'hidden-table-columns-dropdown-hotkey-scope-id';

export const RecordTableHeader = () => {
  const [resizeFieldOffset, setResizeFieldOffset] = useRecoilState(
    resizeFieldOffsetState,
  );

  const {
    tableColumnsState,
    tableColumnsByKeySelector,
    hiddenTableColumnsSelector,
    visibleTableColumnsSelector,
  } = useRecordTableScopedStates();

  const tableColumns = useRecoilValue(tableColumnsState);
  const tableColumnsByKey = useRecoilValue(tableColumnsByKeySelector);
  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector);
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

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
            column.fieldMetadataId === resizedFieldKey
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

  const theme = useTheme();

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
        {visibleTableColumns.map((column) => (
          <StyledColumnHeaderCell
            key={column.fieldMetadataId}
            isResizing={resizedFieldKey === column.fieldMetadataId}
            columnWidth={Math.max(
              tableColumnsByKey[column.fieldMetadataId].size +
                (resizedFieldKey === column.fieldMetadataId
                  ? resizeFieldOffset
                  : 0),
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
                primaryColumnKey={primaryColumn?.fieldMetadataId || ''}
              />
            </StyledColumnHeadContainer>
            <StyledResizeHandler
              className="cursor-col-resize"
              role="separator"
              onPointerDown={() => {
                setResizedFieldKey(column.fieldMetadataId);
              }}
            />
          </StyledColumnHeaderCell>
        ))}
        {hiddenTableColumns.length > 0 && (
          <StyledPlusIconHeaderCell>
            <DropdownScope
              dropdownScopeId={HIDDEN_TABLE_COLUMN_DROPDOWN_SCOPE_ID}
            >
              <Dropdown
                clickableComponent={
                  <StyledPlusIconContainer>
                    <IconPlus size={theme.icon.size.md} />
                  </StyledPlusIconContainer>
                }
                dropdownComponents={<RecordTableHeaderPlusButtonContent />}
                dropdownPlacement="bottom-start"
                dropdownHotkeyScope={{
                  scope: HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID,
                }}
              />
            </DropdownScope>
          </StyledPlusIconHeaderCell>
        )}
      </tr>
    </StyledTableHead>
  );
};
