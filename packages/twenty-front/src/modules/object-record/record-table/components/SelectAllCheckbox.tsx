import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { Checkbox } from '@/ui/input/components/Checkbox';

import { useRecordTable } from '../hooks/useRecordTable';

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  height: 32px;

  justify-content: center;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const SelectAllCheckbox = () => {
  const { allRowsSelectedStatusSelector } = useRecordTableStates();

  const allRowsSelectedStatus = useRecoilValue(allRowsSelectedStatusSelector());
  const { selectAllRows, resetTableRowSelection, setHasUserSelectedAllRows } =
    useRecordTable();

  const checked = allRowsSelectedStatus === 'all';
  const indeterminate = allRowsSelectedStatus === 'some';

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setHasUserSelectedAllRows(true);
      selectAllRows();
    } else {
      setHasUserSelectedAllRows(false);
      resetTableRowSelection();
    }
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
