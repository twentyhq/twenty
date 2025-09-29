import styled from '@emotion/styled';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { cx } from '@linaria/core';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div<{
  shouldDisplayBorderBottom: boolean;
}>`
  align-items: center;
  display: flex;
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  justify-content: center;
  min-width: 24px;
  padding-right: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${theme.border.color.light}`
      : 'none'};
`;

const StyledColumnHeaderCell = styled.div`
  background-color: ${({ theme }) => theme.background.primary};

  min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
  box-sizing: border-box;

  cursor: pointer;

  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;
`;

export const RecordTableHeaderCheckboxColumn = () => {
  const allRowsSelectedStatus = useRecoilComponentValue(
    allRowsSelectedStatusComponentSelector,
  );

  const { selectAllRows } = useSelectAllRows();

  const { resetTableRowSelection } = useResetTableRowSelection();

  const checked =
    allRowsSelectedStatus === 'all' || allRowsSelectedStatus === 'some';
  const indeterminate = allRowsSelectedStatus === 'some';

  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading && allRecordIds.length === 0;

  const onChange = () => {
    if (checked) {
      resetTableRowSelection();
    } else {
      selectAllRows();
    }
  };

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const isScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  const shouldDisplayBorderBottom =
    hasRecordGroups || !isFirstRowActiveOrFocused || isScrolledVertically;

  return (
    <StyledColumnHeaderCell
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME,
      )}
    >
      <StyledContainer
        shouldDisplayBorderBottom={shouldDisplayBorderBottom}
        data-select-disable
      >
        <Checkbox
          hoverable
          checked={checked}
          onChange={onChange}
          indeterminate={indeterminate}
          disabled={recordTableIsEmpty}
        />
      </StyledContainer>
    </StyledColumnHeaderCell>
  );
};
