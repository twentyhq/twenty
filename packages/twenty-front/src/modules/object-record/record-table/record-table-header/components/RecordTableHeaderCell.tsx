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
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
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

  const isFirstRowActive = useRecoilComponentFamilyValueV2(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isScrolledVertically = useRecoilComponentValueV2(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const hasRecordGroups = useRecoilComponentSelectorValueV2(
    hasRecordGroupsComponentSelector,
  );

  const resizedFieldMetadataItemId = useRecoilComponentValueV2(
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
