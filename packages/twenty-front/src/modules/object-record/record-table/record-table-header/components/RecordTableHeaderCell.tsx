import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilCallback } from 'recoil';

import { isObjectReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isObjectReadOnly';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

const COLUMN_MIN_WIDTH = 104;

const StyledColumnHeaderCell = styled.th<{
  columnWidth: number;
  isResizing?: boolean;
  isFirstRowActiveOrFocused: boolean;
}>`
  border-bottom: ${({ isFirstRowActiveOrFocused, theme }) =>
    isFirstRowActiveOrFocused
      ? 'none'
      : `1px solid ${theme.border.color.light}`};
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;

  background-color: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
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

  // TODO: refactor this, each component should own its CSS
  div {
    overflow: hidden;
  }
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

  & > :first-of-type {
    flex: 1;
  }
`;

const StyledHeaderIcon = styled.div`
  margin: ${({ theme }) => theme.spacing(1, 1, 1, 1.5)};
`;

type RecordTableHeaderCellProps = {
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableHeaderCell = ({
  column,
}: RecordTableHeaderCellProps) => {
  const { objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const resizeFieldOffsetState = useRecoilComponentCallbackState(
    resizeFieldOffsetComponentState,
  );

  const [resizeFieldOffset, setResizeFieldOffset] = useRecoilComponentState(
    resizeFieldOffsetComponentState,
  );

  const tableColumns = useRecoilComponentValue(tableColumnsComponentState);
  const tableColumnsByKey = useMemo(
    () =>
      mapArrayToObject(tableColumns, ({ fieldMetadataId }) => fieldMetadataId),
    [tableColumns],
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldKey, setResizedFieldKey] = useState<string | null>(null);

  const { handleColumnsChange } = useTableColumns({
    objectMetadataId: objectMetadataItem.id,
  });

  const handleResizeHandlerStart = useCallback<PointerEventListener>(
    ({ x }) => {
      setInitialPointerPositionX(x);
    },
    [],
  );

  const [iconVisibility, setIconVisibility] = useState(false);

  const handleResizeHandlerMove = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!initialPointerPositionX) return;
      setResizeFieldOffset(x - initialPointerPositionX);
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
      setResizedFieldKey,
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

  const isRecordTableScrolledLeft = useRecoilComponentValue(
    isRecordTableScrolledLeftComponentState,
  );

  const isMobile = useIsMobile();

  const disableColumnResize =
    column.isLabelIdentifier && isMobile && !isRecordTableScrolledLeft;

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const handlePlusButtonClick = () => {
    createNewIndexRecord();
  };

  const isReadOnly = isObjectReadOnly({
    objectPermissions,
  });

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

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
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
    >
      <StyledColumnHeadContainer>
        <RecordTableColumnHeadWithDropdown
          column={column}
          objectMetadataId={objectMetadataItem.id}
        />
        {(useIsMobile() || iconVisibility) &&
          !!column.isLabelIdentifier &&
          !isReadOnly &&
          hasObjectUpdatePermissions && (
            <StyledHeaderIcon>
              <LightIconButton
                Icon={IconPlus}
                size="small"
                accent="tertiary"
                onClick={handlePlusButtonClick}
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
