import styled from '@emotion/styled';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { RecordTableHeaderLabelIdentifierCellPlusButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLabelIdentifierCellPlusButton';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { cx } from '@linaria/core';
import { useState } from 'react';
import { findByProperty } from 'twenty-shared/utils';

const StyledColumnHeadContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;

  & > :first-of-type {
    flex: 1;
  }
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

  if (!recordField) {
    return <></>;
  }

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <RecordTableHeaderCellContainer
      className={cx('header-cell', getRecordTableColumnFieldWidthClassName(0))}
      key={recordField.fieldMetadataItemId}
      onMouseEnter={() => setIconIsVisible(true)}
      onMouseLeave={() => setIconIsVisible(false)}
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
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
