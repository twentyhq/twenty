import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { cx } from '@linaria/core';
import { filterOutByProperty, isDefined } from 'twenty-shared/utils';

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

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  const zIndexWithGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withGroups.scrolledBothVerticallyAndHorizontally
          .firstScrollableHeaderCell
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withGroups.scrolledHorizontallyOnly
            .firstScrollableHeaderCell
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withGroups.scrolledVerticallyOnly
              .firstScrollableHeaderCell
          : TABLE_Z_INDEX.withGroups.noScrollAtAll.firstScrollableHeaderCell;

  const zIndexWithoutGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withoutGroups.scrolledBothVerticallyAndHorizontally
          .firstScrollableHeaderCell
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withoutGroups.scrolledHorizontallyOnly
            .firstScrollableHeaderCell
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withoutGroups.scrolledVerticallyOnly
              .firstScrollableHeaderCell
          : TABLE_Z_INDEX.withoutGroups.noScrollAtAll.firstScrollableHeaderCell;

  const zIndex = hasRecordGroups ? zIndexWithGroups : zIndexWithoutGroups;

  const isScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const shouldDisplayBorderBottom =
    hasRecordGroups || !isFirstRowActiveOrFocused || isScrolledVertically;

  const resizedFieldMetadataItemId = useRecoilComponentValue(
    resizedFieldMetadataIdComponentState,
  );

  const isResizingAnyColumn = isDefined(resizedFieldMetadataItemId);

  if (!recordField) {
    return <></>;
  }

  return (
    <RecordTableHeaderCellContainer
      className={cx('header-cell', getRecordTableColumnFieldWidthClassName(1))}
      key={recordField.fieldMetadataItemId}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      zIndex={zIndex}
      isResizing={isResizingAnyColumn}
    >
      <RecordTableHeaderResizeHandler recordFieldIndex={1} position="left" />
      <RecordTableColumnHeadWithDropdown
        recordField={recordField}
        objectMetadataId={objectMetadataItem.id}
      />
      <RecordTableHeaderResizeHandler recordFieldIndex={1} position="right" />
    </RecordTableHeaderCellContainer>
  );
};
