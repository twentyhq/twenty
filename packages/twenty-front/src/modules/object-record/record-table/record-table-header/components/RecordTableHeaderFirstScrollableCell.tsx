import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHead } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHead';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordTableHeaderSortableHandleRefContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderSortableHandleRefContext';
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
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDisableDragSelectOnPointerDown } from '@/object-record/record-table/record-table-header/hooks/useDisableDragSelectOnPointerDown';

const StyledSortableHandle = styled.div`
  height: 100%;
  min-width: 0;
`;

type RecordTableHeaderFirstScrollableCellProps = {
  firstScrollableRecordField: RecordField;
};

export const RecordTableHeaderFirstScrollableCell = ({
  firstScrollableRecordField,
}: RecordTableHeaderFirstScrollableCellProps) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const {
    onPointerCancel: handlePointerCancel,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  } = useDisableDragSelectOnPointerDown();
  const sortableHandleRef = useContext(
    RecordTableHeaderSortableHandleRefContext,
  );

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

  return (
    <RecordTableHeaderCellContainer
      className={cx('header-cell', getRecordTableColumnFieldWidthClassName(1))}
      key={firstScrollableRecordField.fieldMetadataItemId}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      zIndex={TABLE_Z_INDEX.headerColumns.headerColumnsNormal}
      isResizing={isResizingAnyColumn}
      isReadOnly={isRecordTableColumnHeadersReadOnly}
    >
      {isRecordTableColumnResizable && (
        <RecordTableHeaderResizeHandler recordFieldIndex={1} position="left" />
      )}
      <StyledSortableHandle ref={sortableHandleRef}>
        {isRecordTableColumnHeadersReadOnly ? (
          <RecordTableColumnHead recordField={firstScrollableRecordField} />
        ) : (
          <RecordTableColumnHeadWithDropdown
            recordField={firstScrollableRecordField}
            objectMetadataId={objectMetadataItem.id}
          />
        )}
      </StyledSortableHandle>
      {isRecordTableColumnResizable && (
        <RecordTableHeaderResizeHandler recordFieldIndex={1} position="right" />
      )}
    </RecordTableHeaderCellContainer>
  );
};
