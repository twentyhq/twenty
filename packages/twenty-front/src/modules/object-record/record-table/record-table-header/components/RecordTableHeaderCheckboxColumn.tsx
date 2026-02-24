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
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
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
  const allRowsSelectedStatus = useRecoilComponentSelectorValueV2(
    allRowsSelectedStatusComponentSelector,
  );

  const { selectAllRows } = useSelectAllRows();

  const { resetTableRowSelection } = useResetTableRowSelection();

  const checked =
    allRowsSelectedStatus === 'all' || allRowsSelectedStatus === 'some';
  const indeterminate = allRowsSelectedStatus === 'some';

  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentSelectorValueV2(
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

  const isScrolledVertically = useRecoilComponentValueV2(
    isRecordTableScrolledVerticallyComponentState,
  );

  const hasRecordGroups = useRecoilComponentSelectorValueV2(
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
