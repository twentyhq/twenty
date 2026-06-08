import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHead } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHead';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Draggable } from '@hello-pangea/dnd';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledDragHandle = styled.div`
  height: 100%;
  width: 100%;
`;

type RecordTableHeaderCellProps = {
  recordField: RecordField;
  draggableIndex: number;
  recordFieldIndex: number;
};

export const RecordTableHeaderCell = ({
  recordField,
  draggableIndex,
  recordFieldIndex,
}: RecordTableHeaderCellProps) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const isRecordTableColumnHeadersReadOnly = useAtomComponentStateValue(
    isRecordTableColumnHeadersReadOnlyComponentState,
  );

  const isRecordTableColumnResizable = useAtomComponentStateValue(
    isRecordTableColumnResizableComponentState,
  );

  const isRecordTableRowActive = useAtomComponentFamilyStateValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isRecordTableRowFocused = useAtomComponentFamilyStateValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isRecordTableScrolledVertically = useAtomComponentStateValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRecordTableRowFocusActive = useAtomComponentStateValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isRecordTableRowActive ||
    (isRecordTableRowFocused && isRecordTableRowFocusActive);

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const resizedFieldMetadataId = useAtomComponentStateValue(
    resizedFieldMetadataIdComponentState,
  );

  const isRecordTableHeaderDropProcessing = useAtomComponentStateValue(
    isRecordTableHeaderDropProcessingComponentState,
  );

  const isResizingAnyColumn = isDefined(resizedFieldMetadataId);

  const shouldDisplayBorderBottom =
    hasRecordGroups ||
    !isFirstRowActiveOrFocused ||
    isRecordTableScrolledVertically;

  const handlePointerDown = useCallback(() => {
    setDragSelectionStartEnabled(false);
  }, [setDragSelectionStartEnabled]);

  const handlePointerUp = useCallback(() => {
    setDragSelectionStartEnabled(true);
  }, [setDragSelectionStartEnabled]);

  return (
    <Draggable
      key={recordField.fieldMetadataItemId}
      draggableId={recordField.fieldMetadataItemId}
      index={draggableIndex}
      isDragDisabled={
        isRecordTableHeaderDropProcessing || isRecordTableColumnHeadersReadOnly
      }
    >
      {(draggableProvided) => (
        <RecordTableHeaderCellContainer
          id={`record-table-head-${recordFieldIndex}`}
          ref={draggableProvided.innerRef}
          className={cx(
            'header-cell',
            getRecordTableColumnFieldWidthClassName(recordFieldIndex),
          )}
          key={recordField.fieldMetadataItemId}
          shouldDisplayBorderBottom={shouldDisplayBorderBottom}
          isResizing={isResizingAnyColumn}
          isReadOnly={isRecordTableColumnHeadersReadOnly}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
        >
          {isRecordTableColumnResizable && (
            <RecordTableHeaderResizeHandler
              recordFieldIndex={recordFieldIndex}
              position="left"
            />
          )}
          <StyledDragHandle
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.dragHandleProps}
          >
            {isRecordTableColumnHeadersReadOnly ? (
              <RecordTableColumnHead recordField={recordField} />
            ) : (
              <RecordTableColumnHeadWithDropdown
                recordField={recordField}
                objectMetadataId={objectMetadataItem.id}
              />
            )}
          </StyledDragHandle>
          {isRecordTableColumnResizable && (
            <RecordTableHeaderResizeHandler
              recordFieldIndex={recordFieldIndex}
              position="right"
            />
          )}
        </RecordTableHeaderCellContainer>
      )}
    </Draggable>
  );
};
