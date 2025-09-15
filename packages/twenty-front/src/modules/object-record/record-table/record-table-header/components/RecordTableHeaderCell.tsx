import { type RecordField } from '@/object-record/record-field/types/RecordField';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { cx } from '@linaria/core';

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

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <RecordTableHeaderCellContainer
      className={cx(
        'header-cell',
        getRecordTableColumnFieldWidthClassName(recordFieldIndex),
      )}
      key={recordField.fieldMetadataItemId}
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
    >
      <RecordTableColumnHeadWithDropdown
        recordField={recordField}
        objectMetadataId={objectMetadataItem.id}
      />
      <RecordTableHeaderResizeHandler recordField={recordField} />
    </RecordTableHeaderCellContainer>
  );
};
