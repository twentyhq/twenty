import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/ColumnMinWidth';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { filterOutByProperty } from 'twenty-shared/utils';

export const RecordTableHeaderFirstScrollableCell = () => {
  const { objectMetadataItem, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
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

  const resizeFieldOffset = useRecoilComponentValue(
    resizeFieldOffsetComponentState,
  );

  const resizedFieldMetadataItemId = useRecoilComponentValue(
    resizedFieldMetadataIdComponentState,
  );

  const widthOffsetWhileResizing =
    resizedFieldMetadataItemId === recordField?.fieldMetadataItemId
      ? resizeFieldOffset
      : 0;

  const baseWidth = recordField?.size ?? 0;

  const computedDynamicWidth = baseWidth + widthOffsetWhileResizing;

  const columnWidth = Math.max(computedDynamicWidth, COLUMN_MIN_WIDTH);

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const zIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally
          .firstScrollableHeaderCell
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.firstScrollableHeaderCell
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.firstScrollableHeaderCell
          : TABLE_Z_INDEX.noScrollAtAll.firstScrollableHeaderCell;

  if (!recordField) {
    return <></>;
  }

  return (
    <RecordTableHeaderCellContainer
      className="header-cell"
      key={recordField.fieldMetadataItemId}
      isResizing={
        resizedFieldMetadataItemId === recordField.fieldMetadataItemId
      }
      columnWidth={columnWidth}
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
      zIndex={zIndex}
    >
      <RecordTableColumnHeadWithDropdown
        recordField={recordField}
        objectMetadataId={objectMetadataItem.id}
      />
      <RecordTableHeaderResizeHandler recordField={recordField} />
    </RecordTableHeaderCellContainer>
  );
};
