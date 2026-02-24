import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { cx } from '@linaria/core';

const StyledLastColumnHeader = styled.div<{
  shouldDisplayBorderBottom: boolean;
}>`
  border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${theme.border.color.light}`
      : 'none'};

  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};

  cursor: pointer;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;
`;

export const RecordTableHeaderLastEmptyColumn = () => {
  const isScrolledVertically = useRecoilComponentValueV2(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isFirstRowActive = useRecoilComponentFamilyValueV2(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const hasRecordGroups = useRecoilComponentSelectorValueV2(
    hasRecordGroupsComponentSelector,
  );

  const shouldDisplayBorderBottom =
    hasRecordGroups || !isFirstRowActiveOrFocused || isScrolledVertically;

  return (
    <StyledLastColumnHeader
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME,
      )}
    />
  );
};
