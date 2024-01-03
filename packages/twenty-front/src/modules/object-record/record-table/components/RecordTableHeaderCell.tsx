import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { IconPlus } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';

import { ColumnHeadWithDropdown } from './ColumnHeadWithDropdown';

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
      background: ${theme.background.quaternary};
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

const StyledColumnHeadContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  z-index: 1;
`;

const StyledHeaderIcon = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const RecordTableHeaderCell = ({
  column,
  createRecord,
}: {
  column: ColumnDefinition<FieldMetadata>;
  createRecord: () => void;
}) => {
  const {
    resizeFieldOffsetScopeInjector,
    tableColumnsScopeInjector,
    tableColumnsByKeyScopeInjector,
    visibleTableColumnsScopeInjector,
  } = getRecordTableScopeInjector();

  const {
    injectStateWithRecordTableScopeId,
    injectSelectorWithRecordTableScopeId,
    injectSnapshotValueWithRecordTableScopeId,
  } = useRecordTableScopedStates();

  const resizeFieldOffsetState = injectStateWithRecordTableScopeId(
    resizeFieldOffsetScopeInjector,
  );

  const [resizeFieldOffset, setResizeFieldOffset] = useRecoilState(
    resizeFieldOffsetState,
  );

  const tableColumnsState = injectStateWithRecordTableScopeId(
    tableColumnsScopeInjector,
  );

  const tableColumnsByKeySelector = injectSelectorWithRecordTableScopeId(
    tableColumnsByKeyScopeInjector,
  );

  const visibleTableColumnsSelector = injectSelectorWithRecordTableScopeId(
    visibleTableColumnsScopeInjector,
  );

  const tableColumns = useRecoilValue(tableColumnsState);
  const tableColumnsByKey = useRecoilValue(tableColumnsByKeySelector);
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldKey, setResizedFieldKey] = useState<string | null>(null);

  const { handleColumnsChange } = useTableColumns();

  const handleResizeHandlerStart = useCallback((positionX: number) => {
    setInitialPointerPositionX(positionX);
  }, []);

  const [iconVisibility, setIconVisibility] = useState(false);

  const primaryColumn = visibleTableColumns.find(
    (column) => column.position === 0,
  );

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

        const resizeFieldOffset = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          resizeFieldOffsetScopeInjector,
        );

        const nextWidth = Math.round(
          Math.max(
            tableColumnsByKey[resizedFieldKey].size + resizeFieldOffset,
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
    [
      resizedFieldKey,
      injectSnapshotValueWithRecordTableScopeId,
      resizeFieldOffsetScopeInjector,
      tableColumnsByKey,
      resizeFieldOffsetState,
      tableColumns,
      handleColumnsChange,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldKey !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });

  return (
    <StyledColumnHeaderCell
      key={column.fieldMetadataId}
      isResizing={resizedFieldKey === column.fieldMetadataId}
      columnWidth={Math.max(
        tableColumnsByKey[column.fieldMetadataId].size +
          (resizedFieldKey === column.fieldMetadataId ? resizeFieldOffset : 0) +
          24,
        COLUMN_MIN_WIDTH,
      )}
    >
      <StyledColumnHeadContainer
        onMouseEnter={() => setIconVisibility(true)}
        onMouseLeave={() => setIconVisibility(false)}
      >
        <ColumnHeadWithDropdown
          column={column}
          isFirstColumn={column.position === 1}
          isLastColumn={column.position === visibleTableColumns.length - 1}
          primaryColumnKey={primaryColumn?.fieldMetadataId || ''}
        />
        {iconVisibility && column.position === 0 && (
          <StyledHeaderIcon>
            <LightIconButton
              Icon={IconPlus}
              size="small"
              accent="tertiary"
              onClick={createRecord}
            />
          </StyledHeaderIcon>
        )}
      </StyledColumnHeadContainer>
      <StyledResizeHandler
        className="cursor-col-resize"
        role="separator"
        onPointerDown={() => {
          setResizedFieldKey(column.fieldMetadataId);
        }}
      />
    </StyledColumnHeaderCell>
  );
};
