import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { cx } from '@linaria/core';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledDragDropHeaderCell = styled.div<{
  shouldDisplayBorderBottom: boolean;
  backgroundColor: string;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  max-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  min-height: ${RECORD_TABLE_ROW_HEIGHT}px;
  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;

  cursor: pointer;

  border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${theme.background.primary}`
      : 'none'};
`;

export const RecordTableHeaderDragDropColumn = () => {
  const { theme } = useContext(ThemeContext);

  const isScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  const shouldDisplayBorderBottom =
    hasRecordGroups || !isFirstRowActiveOrFocused || isScrolledVertically;

  return (
    <StyledDragDropHeaderCell
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME,
      )}
      backgroundColor={theme.background.primary}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
    />
  );
};
