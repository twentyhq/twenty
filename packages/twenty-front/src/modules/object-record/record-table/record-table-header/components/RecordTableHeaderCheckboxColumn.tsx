import styled from '@emotion/styled';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { cx } from '@linaria/core';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  min-width: 24px;
  padding-right: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledColumnHeaderCell = styled.div<{
  isFirstRowActiveOrFocused: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};

  min-width: 32px;
  box-sizing: border-box;

  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  max-height: 32px;
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

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <StyledColumnHeaderCell
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME,
      )}
    >
      <StyledContainer data-select-disable>
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
