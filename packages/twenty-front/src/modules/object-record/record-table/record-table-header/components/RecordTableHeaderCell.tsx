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
import { cx } from '@linaria/core';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableHeaderCellProps = {
  recordField: RecordField;
  recordFieldIndex: number;
};

export const RecordTableHeaderCell = ({
  recordField,
  recordFieldIndex,
}: RecordTableHeaderCellProps) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const isRecordTableColumnHeadersReadOnly = useAtomComponentStateValue(
    isRecordTableColumnHeadersReadOnlyComponentState,
  );

  const isRecordTableHeaderDropProcessing = useAtomComponentStateValue(
    isRecordTableHeaderDropProcessingComponentState,
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
    <RecordTableHeaderCellContainer
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      className={cx(
        'header-cell',
        getRecordTableColumnFieldWidthClassName(recordFieldIndex),
      )}
      key={recordField.fieldMetadataItemId}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      isResizing={isResizingAnyColumn}
      isReadOnly={isRecordTableColumnHeadersReadOnly}
    >
      {isRecordTableColumnResizable && (
        <RecordTableHeaderResizeHandler
          recordFieldIndex={recordFieldIndex}
          position="left"
        />
      )}
      {isRecordTableColumnHeadersReadOnly ? (
        <RecordTableColumnHead recordField={recordField} />
      ) : (
        <RecordTableColumnHeadWithDropdown
          recordField={recordField}
          objectMetadataId={objectMetadataItem.id}
        />
      )}
      {isRecordTableColumnResizable && (
        <RecordTableHeaderResizeHandler
          recordFieldIndex={recordFieldIndex}
          position="right"
        />
      )}
    </RecordTableHeaderCellContainer>
  );
};
