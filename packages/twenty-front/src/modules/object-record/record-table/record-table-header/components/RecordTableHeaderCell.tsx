import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { useRecoilCallback } from 'recoil';

import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';

import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveRecordFields } from '@/views/hooks/useSaveRecordFields';
import { throwIfNotDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const COLUMN_MIN_WIDTH = 104;

const StyledColumnHeaderCell = styled.div<{
  columnWidth: number;
  isResizing?: boolean;
  isFirstRowActiveOrFocused: boolean;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;

  background-color: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};

  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  ${({ columnWidth }) => `
      min-width: ${columnWidth}px;
      width: ${columnWidth}px;
      `}
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

  & > :first-of-type {
    flex: 1;
  }
`;

const StyledHeaderIcon = styled.div`
  margin: ${({ theme }) => theme.spacing(1, 1, 1, 1.5)};
`;

type RecordTableHeaderCellProps = {
  recordField: RecordField;
};

export const RecordTableHeaderCell = ({
  recordField,
}: RecordTableHeaderCellProps) => {
  const { objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const resizeFieldOffsetState = useRecoilComponentCallbackState(
    resizeFieldOffsetComponentState,
  );

  const [resizeFieldOffset, setResizeFieldOffset] = useRecoilComponentState(
    resizeFieldOffsetComponentState,
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldMetadataItemId, setResizedFieldMetadataItemId] = useState<
    string | null
  >(null);

  const { saveRecordFields } = useSaveRecordFields();

  const { updateRecordField } = useUpdateRecordField();

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
        throwIfNotDefined(recordField, 'recordField');

        if (!resizedFieldMetadataItemId) return;

        const resizeFieldOffset = getSnapshotValue(
          snapshot,
          resizeFieldOffsetState,
        );

        const nextWidth = Math.round(
          Math.max(recordField.size + resizeFieldOffset, COLUMN_MIN_WIDTH),
        );

        set(resizeFieldOffsetState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldMetadataItemId(null);

        if (nextWidth !== recordField.size) {
          const updatedRecordField = updateRecordField(
            resizedFieldMetadataItemId,
            {
              size: nextWidth,
            },
          );

          saveRecordFields([updatedRecordField]);
        }
      },
    [
      recordField,
      saveRecordFields,
      resizedFieldMetadataItemId,
      resizeFieldOffsetState,
      setResizedFieldMetadataItemId,
      updateRecordField,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldMetadataItemId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });

  const isMobile = useIsMobile();

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const isLabelIdentifier =
    recordField.fieldMetadataItemId === labelIdentifierFieldMetadataItem?.id;

  const disableColumnResize = isLabelIdentifier || isMobile;

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const handlePlusButtonClick = () => {
    createNewIndexRecord();
  };

  const isReadOnly = isObjectMetadataReadOnly({
    objectPermissions,
    objectMetadataItem,
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

  const widthOffsetWhileResizing =
    resizedFieldMetadataItemId === recordField.fieldMetadataItemId
      ? resizeFieldOffset
      : 0;

  const baseWidth = recordField?.size ?? 0;

  const computedDynamicWidth = baseWidth + widthOffsetWhileResizing;

  const columnWidth = Math.max(computedDynamicWidth, COLUMN_MIN_WIDTH);

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <StyledColumnHeaderCell
      className="header-cell"
      key={recordField.fieldMetadataItemId}
      isResizing={
        resizedFieldMetadataItemId === recordField.fieldMetadataItemId
      }
      columnWidth={columnWidth}
      onMouseEnter={() => setIconVisibility(true)}
      onMouseLeave={() => setIconVisibility(false)}
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
    >
      <StyledColumnHeadContainer>
        <RecordTableColumnHeadWithDropdown
          recordField={recordField}
          objectMetadataId={objectMetadataItem.id}
        />
        {(useIsMobile() || iconVisibility) &&
          !!isLabelIdentifier &&
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
            setResizedFieldMetadataItemId(recordField.fieldMetadataItemId);
          }}
        />
      )}
    </StyledColumnHeaderCell>
  );
};
