import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { cx } from '@linaria/core';
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

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  const resizedFieldMetadataItemId = useRecoilComponentValue(
    resizedFieldMetadataIdComponentState,
  );

  const isResizingAnyColumn = isDefined(resizedFieldMetadataItemId);

  const shouldDisplayBorderBottom =
    hasRecordGroups || !isFirstRowActiveOrFocused || isScrolledVertically;

  return (
    <RecordTableHeaderCellContainer
      className={cx(
        'header-cell',
        getRecordTableColumnFieldWidthClassName(recordFieldIndex),
      )}
      key={recordField.fieldMetadataItemId}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      isResizing={isResizingAnyColumn}
    >
      <RecordTableHeaderResizeHandler
        recordFieldIndex={recordFieldIndex}
        position="left"
      />
      <RecordTableColumnHeadWithDropdown
        recordField={recordField}
        objectMetadataId={objectMetadataItem.id}
      />
      <RecordTableHeaderResizeHandler
        recordFieldIndex={recordFieldIndex}
        position="right"
      />
    </RecordTableHeaderCellContainer>
  );
};
