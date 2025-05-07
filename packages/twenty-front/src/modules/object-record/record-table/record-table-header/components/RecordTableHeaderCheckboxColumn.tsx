import styled from '@emotion/styled';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  background-color: ${({ theme }) => theme.background.primary};
`;

const StyledColumnHeaderCell = styled.th<{
  isFirstRowActiveOrFocused: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ isFirstRowActiveOrFocused, theme }) =>
    isFirstRowActiveOrFocused
      ? 'none'
      : `1px solid ${theme.border.color.light}`};
  border-right: transparent;
  width: 30px;
`;

export const RecordTableHeaderCheckboxColumn = () => {
  const allRowsSelectedStatus = useRecoilComponentValueV2(
    allRowsSelectedStatusComponentSelector,
  );
  const { selectAllRows, resetTableRowSelection, setHasUserSelectedAllRows } =
    useRecordTable();
  const checked =
    allRowsSelectedStatus === 'all' || allRowsSelectedStatus === 'some';
  const indeterminate = allRowsSelectedStatus === 'some';

  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading && allRecordIds.length === 0;

  const onChange = () => {
    if (checked) {
      setHasUserSelectedAllRows(false);
      resetTableRowSelection();
    } else {
      setHasUserSelectedAllRows(true);
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

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <StyledColumnHeaderCell
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
    >
      <StyledContainer>
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
