import styled from '@emotion/styled';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordTableHeaderLabelIdentifierCellPlusButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLabelIdentifierCellPlusButton';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { cx } from '@linaria/core';
import { useState } from 'react';
import { findByProperty } from 'twenty-shared/utils';

const StyledColumnHeadContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  overflow: hidden;
`;

export const RecordTableHeaderLabelIdentifierCell = () => {
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

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const recordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', labelIdentifierFieldMetadataItem?.id),
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
    >
      <StyledColumnHeadContainer>
        <RecordTableColumnHeadWithDropdown
          recordField={recordField}
          objectMetadataId={objectMetadataItem.id}
        />
        {iconIsVisible && <RecordTableHeaderLabelIdentifierCellPlusButton />}
      </StyledColumnHeadContainer>
      <RecordTableHeaderResizeHandler recordField={recordField} />
    </RecordTableHeaderCellContainer>
  );
};
