import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { Checkbox } from '@/ui/input/components/Checkbox';

import { useRecordTable } from '../hooks/useRecordTable';

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export const SelectAllCheckbox = () => {
  const { allRowsSelectedStatusScopeInjector } = getRecordTableScopeInjector();

  const { injectSelectorWithRecordTableScopeId } = useRecordTableScopedStates();

  const allRowsSelectedStatusScopedSelector =
    injectSelectorWithRecordTableScopeId(allRowsSelectedStatusScopeInjector);

  const allRowsSelectedStatus = useRecoilValue(
    allRowsSelectedStatusScopedSelector,
  );
  const { selectAllRows } = useRecordTable();

  const checked = allRowsSelectedStatus === 'all';
  const indeterminate = allRowsSelectedStatus === 'some';

  const onChange = () => {
    selectAllRows();
  };

  return (
    <StyledContainer>
      <Checkbox
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    </StyledContainer>
  );
};
