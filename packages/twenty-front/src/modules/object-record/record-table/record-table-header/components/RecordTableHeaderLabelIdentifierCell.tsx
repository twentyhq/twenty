import styled from '@emotion/styled';

import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';

import { RecordTableHeaderCellContainer } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCellContainer';

import { COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/ColumnMinWidth';
import { RecordTableHeaderLabelIdentifierCellPlusButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLabelIdentifierCellPlusButton';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

  const resizeFieldOffset = useRecoilComponentValue(
    resizeFieldOffsetComponentState,
  );

  const resizedFieldMetadataItemId = useRecoilComponentValue(
    resizedFieldMetadataIdComponentState,
  );

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  if (!recordField) {
    return <></>;
  }

  const widthOffsetWhileResizing =
    resizedFieldMetadataItemId === recordField.fieldMetadataItemId
      ? resizeFieldOffset
      : 0;

  const baseWidth = recordField?.size ?? 0;

  const computedDynamicWidth = baseWidth + widthOffsetWhileResizing;

  const columnWidth = Math.max(computedDynamicWidth, COLUMN_MIN_WIDTH);

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <RecordTableHeaderCellContainer
      className="header-cell"
      key={recordField.fieldMetadataItemId}
      isResizing={
        resizedFieldMetadataItemId === recordField.fieldMetadataItemId
      }
      columnWidth={columnWidth}
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
