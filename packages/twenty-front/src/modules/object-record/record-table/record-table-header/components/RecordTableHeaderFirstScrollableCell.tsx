import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHead } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHead';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Draggable } from '@hello-pangea/dnd';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { filterOutByProperty, isDefined } from 'twenty-shared/utils';
import { useCallback } from 'react';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';

const StyledDragHandle = styled.div`
  height: 100%;
  width: 100%;
`;

export const RecordTableHeaderFirstScrollableCell = () => {
  const { objectMetadataItem, visibleRecordFields } =
    useRecordTableContextOrThrow();

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

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const recordField = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  )[0] as RecordField | undefined;

  const isRecordTableRowFocusActive = useAtomComponentStateValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isRecordTableRowActive ||
    (isRecordTableRowFocused && isRecordTableRowFocusActive);

  const isRecordTableScrolledVertically = useAtomComponentStateValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const shouldDisplayBorderBottom =
    hasRecordGroups ||
    !isFirstRowActiveOrFocused ||
    isRecordTableScrolledVertically;

  const resizedFieldMetadataId = useAtomComponentStateValue(
    resizedFieldMetadataIdComponentState,
  );

  const isResizingAnyColumn = isDefined(resizedFieldMetadataId);

  const isRecordTableHeaderDropProcessing = useAtomComponentStateValue(
    isRecordTableHeaderDropProcessingComponentState,
  );

  const handlePointerDown = useCallback(() => {
    setDragSelectionStartEnabled(false);
  }, [setDragSelectionStartEnabled]);

  const handlePointerUp = useCallback(() => {
    setDragSelectionStartEnabled(true);
  }, [setDragSelectionStartEnabled]);

  if (!recordField) {
    return <></>;
  }

  return (
    <Draggable
      key={recordField.fieldMetadataItemId}
      draggableId={recordField.fieldMetadataItemId}
      index={0}
      isDragDisabled={
        isRecordTableHeaderDropProcessing || isRecordTableColumnHeadersReadOnly
      }
    >
      {(draggableProvided) => (
        <RecordTableHeaderCellContainer
          ref={draggableProvided.innerRef}
          className={cx(
            'header-cell',
            getRecordTableColumnFieldWidthClassName(1),
          )}
          key={recordField.fieldMetadataItemId}
          shouldDisplayBorderBottom={shouldDisplayBorderBottom}
          zIndex={TABLE_Z_INDEX.headerColumns.headerColumnsNormal}
          isResizing={isResizingAnyColumn}
          isReadOnly={isRecordTableColumnHeadersReadOnly}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
        >
          {isRecordTableColumnResizable && (
            <RecordTableHeaderResizeHandler
              recordFieldIndex={1}
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
              recordFieldIndex={1}
              position="right"
            />
          )}
        </RecordTableHeaderCellContainer>
      )}
    </Draggable>
  );
};
