import styled from '@emotion/styled';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableHeaderLabelIdentifierCellPlusButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLabelIdentifierCellPlusButton';
import { getVisibleFieldWithLowestPosition } from '@/object-record/record-table/record-table-header/utils/getVisibleFieldWithLowestPosition.util';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { cx } from '@linaria/core';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledPlusButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: ${TABLE_Z_INDEX.headerColumns.withoutGroups.headerColumnsSticky};
`;

export const RecordTableHeaderFirstCell = () => {
  const { objectMetadataItem, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const [iconIsVisible, setIconIsVisible] = useState(false);

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const recordField = getVisibleFieldWithLowestPosition(visibleRecordFields);

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

  if (!recordField) {
    return <></>;
  }

  return (
    <RecordTableHeaderCellContainer
      className={cx('header-cell', getRecordTableColumnFieldWidthClassName(0))}
      key={recordField.fieldMetadataItemId}
      onMouseEnter={() => setIconIsVisible(true)}
      onMouseLeave={() => setIconIsVisible(false)}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      isResizing={isResizingAnyColumn}
    >
      <RecordTableColumnHeadWithDropdown
        recordField={recordField}
        objectMetadataId={objectMetadataItem.id}
      />
      {iconIsVisible && (
        <StyledPlusButtonWrapper>
          <RecordTableHeaderLabelIdentifierCellPlusButton />
        </StyledPlusButtonWrapper>
      )}

      <RecordTableHeaderResizeHandler recordFieldIndex={0} position="right" />
    </RecordTableHeaderCellContainer>
  );
};
