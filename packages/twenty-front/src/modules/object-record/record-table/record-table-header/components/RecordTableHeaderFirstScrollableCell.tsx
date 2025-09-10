import styled from '@emotion/styled';

import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';
import { COLUMN_RESIZE_MIN_WIDTH } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { filterOutByProperty } from 'twenty-shared/utils';

// TODO: factorize duplicated code here
const StyledColumnHeaderCell = styled.div<{
  columnWidth: number;
  isResizing?: boolean;
  isFirstRowActiveOrFocused: boolean;
  zIndex: number;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;

  height: 32px;
  max-height: 32px;

  background-color: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};

  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  ${({ columnWidth }) => `
      min-width: ${columnWidth}px;
      width: ${columnWidth}px;
      `}
  user-select: none;
  ${({ theme }) => {
    return `
    &:hover {
      background: ${theme.background.secondary};
    };
    &:active {
      background: ${theme.background.tertiary};
    };
    `;
  }};
  ${({ isResizing, theme }) => {
    if (isResizing === true) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        top: 0;
        width: 2px;
      }`;
    }
  }};

  // TODO: refactor this, each component should own its CSS
  div {
    overflow: hidden;
  }

  z-index: ${({ zIndex }) => zIndex};
`;

const StyledColumnHeadContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  & > :first-of-type {
    flex: 1;
  }
`;

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

  const columnWidth = Math.max(computedDynamicWidth, COLUMN_RESIZE_MIN_WIDTH);

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
    <StyledColumnHeaderCell
      className="header-cell"
      key={recordField.fieldMetadataItemId}
      isResizing={
        resizedFieldMetadataItemId === recordField.fieldMetadataItemId
      }
      columnWidth={columnWidth}
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
      zIndex={zIndex}
    >
      <StyledColumnHeadContainer>
        <RecordTableColumnHeadWithDropdown
          recordField={recordField}
          objectMetadataId={objectMetadataItem.id}
        />
      </StyledColumnHeadContainer>
      <RecordTableHeaderResizeHandler recordField={recordField} />
    </StyledColumnHeaderCell>
  );
};
