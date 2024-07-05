import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { scrollLeftState } from '@/ui/utilities/scroll/states/scrollLeftState';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

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
      background: ${theme.background.secondary};
    };
    &:active {
      background: ${theme.background.tertiary};
    };
    `;
  }};
  ${({ isResizing, theme }) => {
    if (isResizing === true) {
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
  margin: ${({ theme }) => theme.spacing(1, 1, 1, 1.5)};
`;

export const RecordTableHeaderCell = ({
  column,
  createRecord,
}: {
  column: ColumnDefinition<FieldMetadata>;
  createRecord: () => void;
}) => {
  const { resizeFieldOffsetState, tableColumnsState } = useRecordTableStates();

  const [resizeFieldOffset, setResizeFieldOffset] = useRecoilState(
    resizeFieldOffsetState,
  );

  const tableColumns = useRecoilValue(tableColumnsState);
  const tableColumnsByKey = useMemo(
    () =>
      mapArrayToObject(tableColumns, ({ fieldMetadataId }) => fieldMetadataId),
    [tableColumns],
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldKey, setResizedFieldKey] = useState<string | null>(null);

  const { handleColumnsChange } = useTableColumns();

  const handleResizeHandlerStart = useCallback((positionX: number) => {
    setInitialPointerPositionX(positionX);
  }, []);

  const [iconVisibility, setIconVisibility] = useState(false);

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

        const resizeFieldOffset = getSnapshotValue(
          snapshot,
          resizeFieldOffsetState,
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
      resizeFieldOffsetState,
      tableColumnsByKey,
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

  const isMobile = useIsMobile();
  const scrollLeft = useRecoilValue(scrollLeftState);

  const disableColumnResize =
    column.isLabelIdentifier && isMobile && scrollLeft > 0;

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
      onMouseEnter={() => setIconVisibility(true)}
      onMouseLeave={() => setIconVisibility(false)}
    >
      <StyledColumnHeadContainer>
        <ColumnHeadWithDropdown column={column} />
        {(useIsMobile() || iconVisibility) && !!column.isLabelIdentifier && (
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
      {!disableColumnResize && (
        <StyledResizeHandler
          className="cursor-col-resize"
          role="separator"
          onPointerDown={() => {
            setResizedFieldKey(column.fieldMetadataId);
          }}
        />
      )}
    </StyledColumnHeaderCell>
  );
};
